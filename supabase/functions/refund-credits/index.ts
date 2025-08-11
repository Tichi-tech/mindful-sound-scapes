import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REFUND-CREDITS] ${step}${detailsStr}`);
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
      throw new Error("Invalid refund amount");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    
    logStep("User authenticated", { userId: user.id, amount, reason });

    // Get current credits
    const { data: userCredits, error: creditsError } = await supabaseClient
      .from('user_credits')
      .select('current_credits, daily_allocation')
      .eq('user_id', user.id)
      .single();

    if (creditsError) {
      throw new Error(`Error fetching credits: ${creditsError.message}`);
    }

    const currentCredits = userCredits.current_credits;
    const dailyAllocation = userCredits.daily_allocation;
    
    // Refund credits but don't exceed daily allocation
    const newBalance = Math.min(currentCredits + amount, dailyAllocation);
    const actualRefund = newBalance - currentCredits;

    logStep("Refund calculation", { 
      currentCredits, 
      requestedRefund: amount, 
      actualRefund, 
      newBalance 
    });

    // Update credits
    const { error: updateError } = await supabaseClient
      .from('user_credits')
      .update({ 
        current_credits: newBalance,
        total_credits_used: Math.max(0, supabaseClient.sql`total_credits_used - ${actualRefund}`),
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
        transaction_type: 'refund',
        amount: actualRefund,
        reason: reason || 'Generation failed - credit refund',
        session_id,
        track_id,
        remaining_credits: newBalance
      });

    if (transactionError) {
      logStep("Error logging transaction", { error: transactionError });
    }

    logStep("Credits refunded successfully", { 
      refunded: actualRefund, 
      newBalance 
    });

    return new Response(JSON.stringify({
      success: true,
      credits_refunded: actualRefund,
      remaining_credits: newBalance
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in refund-credits", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});