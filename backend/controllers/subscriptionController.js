const supabase = require('../config/supabase');

/**
 * @desc    Get user subscription status
 * @route   GET /api/subscriptions/status
 * @access  Private (Needs Auth)
 */
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    res.status(200).json({
      success: true,
      subscription: data || { status: 'inactive' }
    });
  } catch (error) {
    console.error('Error fetching subscription:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch subscription status' });
  }
};

const { Environment, LogLevel, Paddle } = require('@paddle/paddle-node-sdk');

// Initialize Paddle SDK for Backend Verification
const paddle = new Paddle(process.env.PADDLE_API_KEY || 'dummy_key', {
  environment: process.env.PADDLE_ENV === 'production' ? Environment.production : Environment.sandbox,
});

/**
 * @desc    Handle Paddle Webhook
 * @route   POST /api/webhook/paddle
 * @access  Public (Should be secured via Paddle signature in production)
 */
exports.handleWebhook = async (req, res) => {
  try {
    const eventData = req.body;
    console.log('--- [PADDLE WEBHOOK] ---');
    console.log(`[Time] ${new Date().toISOString()}`);
    console.log(`[Event] ${eventData.event_type}`);
    
    // Process Subscription and Transaction events
    const isSubscriptionEvent = eventData.event_type && eventData.event_type.startsWith('subscription.');
    const isTransactionCompleted = eventData.event_type === 'transaction.completed';

    if (isSubscriptionEvent || isTransactionCompleted) {
      const data = eventData.data || {};
      
      // Extract custom_data (check both levels)
      const customData = data.custom_data || eventData.custom_data || {};
      const userId = customData.user_id;

      console.log(`[Info] Extraction -> UserID: ${userId || 'MISSING'}, CustID: ${data.customer_id}`);

      if (userId) {
        let dbStatus = data.status || 'active';
        if (isTransactionCompleted && (dbStatus === 'completed' || !data.status)) {
          dbStatus = 'active';
        }

        const updateData = {
          user_id: userId,
          paddle_customer_id: data.customer_id,
          status: dbStatus,
          updated_at: new Date().toISOString()
        };

        if (isSubscriptionEvent) {
          updateData.paddle_subscription_id = data.id;
          updateData.plan_id = data.items?.[0]?.price?.id || 'unknown';
        } else if (isTransactionCompleted) {
          updateData.paddle_subscription_id = data.subscription_id || null;
        }

        console.log(`[Database] Attempting update for ${userId}...`);

        const { supabaseAdmin } = require('../config/supabase');
        
        // 1. Check existing
        const { data: existing, error: checkError } = await supabaseAdmin
          .from('subscriptions')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (checkError) console.error(`[Supabase Error] Check failed: ${checkError.message}`);

        let dbError;
        if (existing) {
          console.log(`[Database] User exists. Performing UPDATE.`);
          const { error } = await supabaseAdmin
            .from('subscriptions')
            .update(updateData)
            .eq('user_id', userId);
          dbError = error;
        } else {
          console.log(`[Database] New user. Performing INSERT.`);
          const { error } = await supabaseAdmin
            .from('subscriptions')
            .insert(updateData);
          dbError = error;
        }

        if (dbError) {
          console.error(`[Database Result] ❌ FAILED: ${dbError.message}`);
          console.error(`[Database Payload]`, JSON.stringify(updateData));
        } else {
          console.log(`[Database Result] ✅ SUCCESS: User ${userId} is now ${dbStatus}`);
        }
      } else {
        console.warn(`[Warning] ⚠ No user_id in payload. Webhook cannot be mapped to a user.`);
        console.log(`[Payload Preview]`, JSON.stringify(data).substring(0, 200) + '...');
      }
    } else {
      console.log(`[Ignore] Event type ${eventData.event_type} not handled.`);
    }
    
    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('[Paddle Webhook] ❌ Processing Error:', error);
    res.status(500).send('Webhook processing failed');
  }
};

/**
 * Direct Update Bypass (For Dev/Fail-safe)
 * Allows the frontend to directly signal a status update
 */
exports.forceUpdateSubscription = async (req, res) => {
  const { supabaseAdmin } = require('../config/supabase');
  const userId = req.user.id; // Get ID from Auth Middleware
  
  console.log('--- [INSTANT UNLOCK REQUEST] ---');
  console.log(`[Time] ${new Date().toISOString()}`);
  console.log(`[User] ${userId}`);

  try {
    // 1. Verify User Profile exists
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (profileError || !profile) {
      console.error(`[Database] ❌ Profile not found for User: ${userId}`);
      return res.status(404).json({ error: 'User profile not found in database' });
    }

    // 2. Perform Upsert to Active
    const updateData = {
      user_id: userId,
      status: 'active',
      plan_id: 'pro_monthly', 
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .upsert(updateData, { onConflict: 'user_id' })
      .select();

    if (error) {
      console.error('[Database] ❌ Instant Unlock Failed:', error.message);
      throw error;
    }

    console.log('[Database] 🚀 SUCCESS: Subscription record UNLOCKED:', data[0]);

    res.status(200).json({
      success: true,
      message: 'Subscription activated via Instant Unlock',
      subscription: data[0]
    });
  } catch (error) {
    console.error('[Critical] Instant Unlock Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Get Paddle Customer Portal / Management Link
 * @route   GET /api/subscriptions/manage
 * @access  Private
 */
exports.getManagementLink = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get the subscription ID from our DB
    const { data: sub, error } = await supabase
      .from('subscriptions')
      .select('paddle_subscription_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !sub?.paddle_subscription_id) {
      return res.status(404).json({ success: false, error: 'No active subscription found to manage.' });
    }

    // 2. Generate the link via Paddle SDK
    // Note: getManagementUrl is the method for Paddle Node SDK v3
    const managementUrl = await paddle.subscriptions.getManagementUrl(sub.paddle_subscription_id);

    res.json({ success: true, url: managementUrl });
  } catch (error) {
    console.error('[Paddle Management Link Error]:', error);
    res.status(500).json({ success: false, error: 'Failed to generate management link' });
  }
};
