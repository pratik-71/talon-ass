const supabase = require('../config/supabase');

/**
 * @desc    Get full dashboard data for the authenticated user
 * @route   GET /api/dashboard
 * @access  Private
 *
 * Returns: subscription, scores (last 5), charity, draws participated, winnings
 */
exports.getDashboardData = async (req, res) => {
  try {
    if (!supabase) {
      console.error('[DashboardController] Supabase client NOT initialized!');
      return res.status(500).json({ success: false, error: 'Database service is currently unavailable. Check environment variables.' });
    }
    const userId = req.user.id;

    // 1. Subscription status
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('status, plan_id, current_period_end, paddle_subscription_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (subError) throw subError;

    // 2. Last 5 scores (reverse chronological)
    const { data: scores, error: scoreError } = await supabase
      .from('scores')
      .select('id, score, date, created_at')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(5);

    if (scoreError) throw scoreError;

    // 3. User profile + charity
    let { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('full_name, donation_percentage, charity_id, charities(name, description, logo_url)')
      .eq('id', userId)
      .maybeSingle();

    // ── FALLBACK: Create profile if missing ──
    if (!profile && !profileError) {
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          full_name: req.user.user_metadata?.full_name || 'Hero',
          donation_percentage: req.user.user_metadata?.donation_percentage || 10,
          charity_id: req.user.user_metadata?.charity_id || null
        })
        .select('full_name, donation_percentage, charity_id, charities(name, description, logo_url)')
        .single();
      
      if (!createError) profile = newProfile;
    } else if (profileError) {
      throw profileError;
    }

    // 4. Draw participation: count of draws user was eligible for (has scores)
    const { data: draws, error: drawError } = await supabase
      .from('draw_entries')
      .select('id, draw_id, matched_numbers, prize_tier, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (drawError) throw drawError;

    // 5. Winnings overview
    const { data: winnings, error: winError } = await supabase
      .from('winners')
      .select('id, amount, prize_tier, payment_status, proof_url, created_at, draw_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (winError) throw winError;

    const totalWon = (winnings || []).reduce((sum, w) => sum + (w.amount || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        subscription: subscription || { status: 'inactive' },
        scores: scores || [],
        charity: profile?.charities || null,
        donation_percentage: profile?.donation_percentage || 10,
        full_name: profile?.full_name || req.user.email,
        draws: draws || [],
        winnings: winnings || [],
        total_won: totalWon,
      },
    });
  } catch (error) {
    console.error('[DashboardController] getDashboardData error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to load dashboard data.' });
  }
};

/**
 * @desc    Upload winner proof (screenshot URL or file path)
 * @route   POST /api/dashboard/upload-proof
 * @access  Private (winners only)
 */
exports.uploadProof = async (req, res) => {
  try {
    const userId = req.user.id;
    const { winner_id, proof_url } = req.body;

    if (!winner_id || !proof_url) {
      return res.status(400).json({ success: false, error: 'winner_id and proof_url are required.' });
    }

    // Verify the winner record belongs to this user
    const { data: winner, error: ownerError } = await supabase
      .from('winners')
      .select('id, user_id, payment_status')
      .eq('id', winner_id)
      .eq('user_id', userId)
      .maybeSingle();

    if (ownerError) throw ownerError;
    if (!winner) {
      return res.status(404).json({ success: false, error: 'Winner record not found or not yours.' });
    }

    const { data: updated, error: updateError } = await supabase
      .from('winners')
      .update({ proof_url, payment_status: 'pending_review' })
      .eq('id', winner_id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json({ success: true, message: 'Proof submitted for review.', data: updated });
  } catch (error) {
    console.error('[DashboardController] uploadProof error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to upload proof.' });
  }
};
