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
    
    console.log('--- PADDLE WEBHOOK RECEIVED ---');
    console.log(`Event Type: ${eventData.event_type}`);
    console.log(`Event ID: ${eventData.id}`);
    
    // In a full production app, you MUST verify the webhook signature here.
    // paddle.webhooks.unmarshal(req.body, req.headers['paddle-signature'], process.env.PADDLE_WEBHOOK_SECRET)
    
    // Process Subscription and Transaction events
    const isSubscriptionEvent = eventData.event_type && eventData.event_type.startsWith('subscription.');
    const isTransactionCompleted = eventData.event_type === 'transaction.completed';

    if (isSubscriptionEvent || isTransactionCompleted) {
      const data = eventData.data;
      console.log(`[Paddle Webhook] Processing data for: ${data.id}`);
      
      // Extract custom_data (could be at data level or root level depending on event version)
      const customData = data.custom_data || eventData.custom_data || {};
      const userId = customData.user_id;

      console.log(`[Paddle Webhook] Custom Data Found:`, JSON.stringify(customData));
      console.log(`[Paddle Webhook] User ID extracted: ${userId}`);

      if (userId) {
        // Prepare subscription data
        // For transactions, we might not have the subscription ID yet if it's the first one
        const updateData = {
          user_id: userId,
          paddle_customer_id: data.customer_id,
          status: data.status || 'active',
          updated_at: new Date().toISOString()
        };

        if (isSubscriptionEvent) {
          updateData.paddle_subscription_id = data.id;
          updateData.plan_id = data.items?.[0]?.price?.id || 'unknown';
        } else if (isTransactionCompleted) {
          updateData.paddle_subscription_id = data.subscription_id || null;
        }

        console.log(`[Paddle Webhook] Upserting to Supabase for User: ${userId}`, updateData);

        // Upsert subscription into Supabase
        // We use user_id as the primary link here if paddle_subscription_id is missing
        const { error } = await supabase
          .from('subscriptions')
          .upsert(updateData, { onConflict: 'user_id' });

        if (error) {
          console.error('[Paddle Webhook] Supabase Update Error:', error.message);
          console.error('[Paddle Webhook] Error details:', JSON.stringify(error));
        } else {
          console.log(`[Paddle Webhook] ✅ Successfully updated subscription for user ${userId}`);
        }
      } else {
        console.warn(`[Paddle Webhook] ⚠ No user_id found in custom_data for event ${eventData.id}`);
        console.log(`[Paddle Webhook] Full data received:`, JSON.stringify(data));
      }
    } else {
      console.log(`[Paddle Webhook] Ignoring event type: ${eventData.event_type}`);
    }
    
    // Always return 200 OK so Paddle knows we received it
    res.status(200).send('Webhook processed');
  } catch (error) {
    console.error('[Paddle Webhook] ❌ Processing Error:', error);
    res.status(500).send('Webhook processing failed');
  }
};
