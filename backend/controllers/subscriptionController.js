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
    // In a full production app, you MUST verify the webhook signature here using:
    // paddle.webhooks.unmarshal(req.body, req.headers['paddle-signature'], process.env.PADDLE_WEBHOOK_SECRET)
    
    const eventData = req.body;
    
    console.log(`[Paddle Webhook] Event Received: ${eventData.event_type}`);

    // Handle all Subscription events (created, updated, canceled, paused, etc.)
    if (eventData.event_type && eventData.event_type.startsWith('subscription.')) {
      const subscription = eventData.data;
      
      console.log(`[Paddle Webhook] Processing subscription: ${subscription.id} for customer: ${subscription.customer_id}`);
      
      // Extract custom_data which should contain the user_id from the frontend
      const userId = subscription.custom_data?.user_id;

      if (userId) {
        // Upsert subscription into Supabase
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            paddle_subscription_id: subscription.id,
            paddle_customer_id: subscription.customer_id,
            status: subscription.status, // e.g., 'active', 'canceled'
            plan_id: subscription.items[0]?.price?.id || 'unknown',
            updated_at: new Date().toISOString()
          }, { onConflict: 'paddle_subscription_id' });

        if (error) {
          console.error('[Paddle Webhook] Supabase Update Error:', error.message);
        } else {
          console.log(`[Paddle Webhook] Successfully updated subscription for user ${userId}`);
        }
      } else {
        console.warn(`[Paddle Webhook] No user_id found in custom_data for subscription ${subscription.id}`);
      }
    }
    
    // Always return 200 OK so Paddle knows we received it
    res.status(200).send('Webhook processed');
  } catch (error) {
    console.error('[Paddle Webhook] Processing Error:', error);
    res.status(500).send('Webhook processing failed');
  }
};
