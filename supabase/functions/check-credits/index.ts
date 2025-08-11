import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-CREDITS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Use service role key to bypass RLS for credit operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    
    logStep("User authenticated", { userId: user.id });

    // Call the database function to check and reset credits
    const { data: creditData, error: creditError } = await supabaseClient
      .rpc('check_and_reset_credits', { p_user_id: user.id });

    if (creditError) {
      logStep("Error checking credits", { error: creditError });
      throw new Error(`Credit check error: ${creditError.message}`);
    }

    const creditResult = creditData?.[0];
    logStep("Credit check result", creditResult);

    // Get user subscription info
    const { data: subscriptionData, error: subError } = await supabaseClient
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans(*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (subError && subError.code !== 'PGRST116') {
      logStep("Error fetching subscription", { error: subError });
    }

    // Get next reset time (24 hours from first action)
    const { data: userCredits, error: userCreditsError } = await supabaseClient
      .from('user_credits')
      .select('first_action_today')
      .eq('user_id', user.id)
      .single();

    let nextResetTime = null;
    if (userCredits?.first_action_today) {
      const firstAction = new Date(userCredits.first_action_today);
      nextResetTime = new Date(firstAction.getTime() + 24 * 60 * 60 * 1000);
    }

    const response = {
      current_credits: creditResult?.current_credits || 0,
      needs_reset: creditResult?.needs_reset || false,
      subscription: subscriptionData ? {
        plan_name: subscriptionData.subscription_plans?.name,
        daily_credits: subscriptionData.subscription_plans?.daily_credits,
        features: subscriptionData.subscription_plans?.features
      } : null,
      next_reset_time: nextResetTime?.toISOString()
    };

    logStep("Returning response", response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-credits", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});