import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DEDUCT-CREDITS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const body = await req.json();
    const { amount, reason, session_id, track_id } = body;

    if (!amount || amount <= 0) {
      throw new Error("Invalid credit amount");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    
    logStep("User authenticated", { userId: user.id, amount, reason });

    // First check and reset credits if needed
    const { data: creditCheck, error: checkError } = await supabaseClient
      .rpc('check_and_reset_credits', { p_user_id: user.id });

    if (checkError) {
      throw new Error(`Credit check error: ${checkError.message}`);
    }

    const currentCredits = creditCheck?.[0]?.current_credits || 0;
    logStep("Current credits", { currentCredits });

    // Check if user has enough credits
    if (currentCredits < amount) {
      logStep("Insufficient credits", { required: amount, available: currentCredits });
      return new Response(JSON.stringify({ 
        error: "Insufficient credits",
        required: amount,
        available: currentCredits
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Deduct credits
    const newBalance = currentCredits - amount;
    const { error: updateError } = await supabaseClient
      .from('user_credits')
      .update({ 
        current_credits: newBalance,
        total_credits_used: supabaseClient.sql`total_credits_used + ${amount}`,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      logStep("Error updating credits", { error: updateError });
      throw new Error(`Credit update error: ${updateError.message}`);
    }

    // Log the transaction
    const { error: transactionError } = await supabaseClient
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'deduction',
        amount: -amount, // Negative for deduction
        reason: reason || 'Generation request',
        session_id,
        track_id,
        remaining_credits: newBalance
      });

    if (transactionError) {
      logStep("Error logging transaction", { error: transactionError });
      // Don't fail the whole operation for logging errors
    }

    logStep("Credits deducted successfully", { 
      deducted: amount, 
      remaining: newBalance 
    });

    return new Response(JSON.stringify({
      success: true,
      credits_deducted: amount,
      remaining_credits: newBalance
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in deduct-credits", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});