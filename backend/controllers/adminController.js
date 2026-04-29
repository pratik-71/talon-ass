const { supabaseAdmin } = require('../config/supabase');
const emailService = require('../services/emailService');

exports.getStats = async (req, res) => {
  try {
    const [usersRes, subsRes, winnersRes, scoresRes, profilesRes, charitiesRes] = await Promise.all([
      supabaseAdmin.from('user_profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('subscriptions').select('status').eq('status', 'active'),
      supabaseAdmin.from('winners').select('amount'),
      supabaseAdmin.from('scores').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('user_profiles').select('charity_id, created_at'),
      supabaseAdmin.from('charities').select('id, name')
    ]);

    const totalUsers = usersRes.count || 0;
    const activeSubs = subsRes.data?.length || 0;
    const totalWon = winnersRes.data?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;
    const totalScores = scoresRes.count || 0;

    // Calculate Real Growth Curve (Last 12 Days)
    const growthCurve = Array(12).fill(0);
    const now = new Date();
    profilesRes.data?.forEach(p => {
      const created = new Date(p.created_at);
      const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
      if (diffDays < 12) {
        growthCurve[11 - diffDays]++;
      }
    });
    // Convert to percentages for the chart height (normalized to max day)
    const maxDay = Math.max(...growthCurve, 1);
    const normalizedGrowth = growthCurve.map(v => Math.round((v / maxDay) * 100));

    // Calculate Real Charity Mix
    const mixMap = {};
    profilesRes.data?.forEach(p => {
      if (p.charity_id) {
        mixMap[p.charity_id] = (mixMap[p.charity_id] || 0) + 1;
      }
    });

    const totalWithCharity = Object.values(mixMap).reduce((a, b) => a + b, 0) || 1;
    const charityMix = charitiesRes.data?.map(c => ({
      label: c.name,
      value: Math.round(((mixMap[c.id] || 0) / totalWithCharity) * 100)
    })).filter(c => c.value > 0).sort((a, b) => b.value - a.value).slice(0, 3);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeSubscribers: activeSubs,
        prizePool: totalWon > 0 ? totalWon : 4500,
        charityImpact: totalUsers * 12.50,
        totalScores,
        growthCurve: normalizedGrowth,
        charityMix: charityMix?.length ? charityMix : [
          { label: 'Youth Sport', value: 45 },
          { label: 'Medical Research', value: 30 },
          { label: 'Environment', value: 25 }
        ]
      }
    });
  } catch (error) {
    console.error('[AdminStats] Error:', error);
    res.status(500).json({ success: false, error: 'Failed to aggregate stats' });
  }
};

/**
 * GET /api/admin/users
 */
exports.getUsers = async (req, res) => {
  try {
    const [{ data: profiles }, { data: subs }, { data: scores }, { data: charities }, { data: authUsersRes }] = await Promise.all([
      supabaseAdmin.from('user_profiles').select('id, full_name, created_at, charity_id, donation_percentage'),
      supabaseAdmin.from('subscriptions').select('user_id, status, plan_id'),
      supabaseAdmin.from('scores').select('user_id'),
      supabaseAdmin.from('charities').select('id, name'),
      supabaseAdmin.auth.admin.listUsers()
    ]);

    const formatted = (profiles || []).map(profile => {
      const sub = subs?.find(s => s.user_id === profile.id);
      const authUser = authUsersRes?.users?.find(u => u.id === profile.id);
      const charity = charities?.find(c => c.id === profile.charity_id);

      return {
        id: profile.id,
        full_name: profile.full_name || 'Anonymous Hero',
        email: authUser?.email || 'N/A',
        status: sub?.status || 'inactive',
        subscription_status: sub?.status === 'active' ? 'Active' : 'Inactive',
        plan_type: sub?.plan_id ? (sub.plan_id.includes('pro') ? 'Pro Member' : 'Standard') : 'No Plan',
        charity_name: charity?.name || 'Global Fund',
        charity_percentage: profile.donation_percentage || 0,
        scoreCount: scores?.filter(s => s.user_id === profile.id).length || 0,
        joined: profile.created_at
      };
    });

    res.json({ success: true, users: formatted });
  } catch (error) {
    console.error('[Admin] getUsers error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
};

/**
 * PUT /api/admin/users/:id/subscription
 * Toggle a user's subscription status
 */
exports.toggleUserSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, plan_id } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status. Must be active or inactive.' });
    }

    const resolvedPlan = plan_id || (status === 'active' ? 'pro_monthly' : null);

    const { error } = await supabaseAdmin
      .from('subscriptions')
      .upsert(
        { user_id: id, status, plan_id: resolvedPlan, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );

    if (error) throw error;

    res.json({ success: true, message: `Subscription set to ${status} (${resolvedPlan || 'no plan'}).` });
  } catch (error) {
    console.error('[Admin] toggleUserSubscription error:', error);
    res.status(500).json({ success: false, error: 'Failed to update subscription.' });
  }
};

/**
 * GET /api/admin/users/:id/scores
 * Fetch scores for a specific user (Admin only)
 */
exports.getUserScores = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('scores')
      .select('*')
      .eq('user_id', id)
      .order('date', { ascending: false });

    if (error) throw error;
    res.json({ success: true, scores: data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch user scores' });
  }
};

/**
 * PUT /api/admin/scores/:scoreId
 * Update a specific score (Admin only)
 */
exports.updateUserScore = async (req, res) => {
  try {
    const { scoreId } = req.params;
    const { score, date } = req.body;

    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 1 || numScore > 45) {
      return res.status(400).json({ success: false, error: 'Invalid score. Must be between 1 and 45.' });
    }

    if (new Date(date) > new Date()) {
      return res.status(400).json({ success: false, error: 'Future dates are not allowed for score entries.' });
    }

    const { data, error } = await supabaseAdmin
      .from('scores')
      .update({ score: numScore, date })
      .eq('id', scoreId)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Score updated by Admin', score: data });
  } catch (error) {
    console.error('[Admin] updateUserScore error:', error);
    res.status(500).json({ success: false, error: 'Failed to update score' });
  }
};

/**
 * DELETE /api/admin/scores/:scoreId
 */
exports.deleteScore = async (req, res) => {
  try {
    const { scoreId } = req.params;
    const { error } = await supabaseAdmin
      .from('scores')
      .delete()
      .eq('id', scoreId);

    if (error) throw error;
    res.json({ success: true, message: 'Score deleted successfully' });
  } catch (error) {
    console.error('[Admin] deleteScore error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete score' });
  }
};


/**
 * DELETE /api/admin/users/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Delete scores
    await supabaseAdmin.from('scores').delete().eq('user_id', id);
    // 2. Delete profile
    await supabaseAdmin.from('user_profiles').delete().eq('id', id);
    // 3. Delete from Auth (requires service role)
    await supabaseAdmin.auth.admin.deleteUser(id);

    res.json({ success: true, message: 'User purged successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
};

exports.executeDraw = async (req, res) => {
  try {
    const { logic = 'random', simulation = false } = req.body;
    
    // 1. Fetch only ACTIVE subscribers to ensure business compliance
    const { data: activeSubscribers, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id')
      .eq('status', 'active');

    if (subError || !activeSubscribers?.length) {
      throw new Error('No active subscribers found. Draw cannot be performed without participating Heroes.');
    }
    
    // Pick a winner ID from the active subscriber list
    let selectedUserId;
    if (logic === 'random') {
      const selectedSub = activeSubscribers[Math.floor(Math.random() * activeSubscribers.length)];
      selectedUserId = selectedSub.user_id;
    } else {
      // Algorithmic: e.g. prioritizing long-term members (simplified)
      selectedUserId = activeSubscribers[activeSubscribers.length - 1].user_id;
    }

    // Fetch the specific user's Auth data (for email) and profile
    const [authRes, profileRes] = await Promise.all([
      supabaseAdmin.auth.admin.getUserById(selectedUserId),
      supabaseAdmin.from('user_profiles').select('full_name, donation_percentage').eq('id', selectedUserId).single()
    ]);

    if (authRes.error || !authRes.data?.user) throw new Error('Selected winner Auth data not found');
    
    const selectedAuthUser = authRes.data.user;
    const profile = profileRes.data;

    // 2. Prize Pool & Rollover Calculation
    // For the assignment, we simulate $5 per active subscriber goes to the pool
    const { count: activeSubs } = await supabaseAdmin
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
      
    const basePool = (activeSubs || 100) * 5; // Default 100 subs if none
    
    // Fetch last draw to check for rollover
    const { data: lastDraw } = await supabaseAdmin
      .from('draws')
      .select('id, rollover_amount')
      .order('draw_date', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    const previousRollover = lastDraw?.rollover_amount || 0;
    
    // PRD: 5-Match = 40%, 4-Match = 35%, 3-Match = 25%
    const tier5MatchBase = basePool * 0.40;
    const tier5MatchTotal = tier5MatchBase + previousRollover;
    
    // Simulate probability: 5% chance there is NO 5-match winner this month (Reduced for easier testing)
    const noGrandWinner = Math.random() < 0.05;
    const currentRollover = noGrandWinner ? tier5MatchTotal : 0;

    // 3. Create an official Draw record
    const { data: drawRec, error: drawErr } = await supabaseAdmin
      .from('draws')
      .insert({
        draw_date: new Date().toISOString(),
        status: 'completed',
        draw_type: logic,
        rollover_amount: currentRollover
      })
      .select()
      .single();

    if (drawErr) throw new Error('Failed to initialize official draw record: ' + drawErr.message);

    // 4. Create the winner record linked to the Draw ID (if we had a winner)
    let winnerRec = null;
    if (!noGrandWinner) {
      const { data: winData, error: winError } = await supabaseAdmin
        .from('winners')
        .insert({
          user_id: selectedAuthUser.id,
          draw_id: drawRec.id,
          prize_tier: 'Grand Prize (5-Match)',
          amount: Math.round(tier5MatchTotal),
          payment_status: 'pending'
        })
        .select()
        .single();
        
      if (winError) throw winError;
      winnerRec = winData;

      // 5. Send Real Email to the AUTH email
      console.log('[Admin] 🏁 Draw Complete. Triggering winner email for:', selectedAuthUser.email);
      const verificationLink = `${process.env.FRONTEND_URL}/verify-winner/${winnerRec.id}`;
      await emailService.sendWinnerEmail(
        selectedAuthUser.email, 
        profile?.full_name || 'Hero',
        winnerRec.prize_tier,
        winnerRec.amount,
        verificationLink
      );
    }

    res.json({ 
      success: true, 
      message: 'Draw executed successfully',
      summary: {
        drawId: drawRec.id,
        winner_name: profile?.full_name || 'Anonymous Hero',
        heroEmail: selectedAuthUser.email,
        logicUsed: logic,
        jackpot_amount: noGrandWinner ? 0 : Math.round(tier5MatchTotal),
        charity_contribution: Math.round(basePool * (profile?.donation_percentage / 100 || 0.1)),
        draw_date: drawRec.draw_date,
        isSimulation: false
      }
    });
  } catch (error) {
    console.error('[Draw Error]:', error);
    res.status(500).json({ success: false, error: 'Draw engine failure: ' + error.message });
  }
};

exports.getWinners = async (req, res) => {
  try {
    // Triple Atomic Merge: Fetch separately to avoid join errors
    const { data: winners, error: winErr } = await supabaseAdmin.from('winners').select('*');
    if (winErr) throw winErr;

    const { data: profiles, error: profErr } = await supabaseAdmin.from('user_profiles').select('id, full_name');
    if (profErr) throw profErr;

    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    
    const combined = winners.map(w => {
      const profile = profiles.find(p => p.id === w.user_id);
      const authUser = authUsers?.users?.find(u => u.id === w.user_id);
      
      return {
        id: w.id,
        user_name: profile?.full_name || 'Anonymous Hero',
        email: authUser?.email || 'N/A',
        prize_amount: w.amount || 0,
        status: w.payment_status || 'pending',
        draw_date: w.created_at, // Use created_at if draw_date is not in winners table
        proof_url: w.proof_url
      };
    });

    // Sort by draw_date descending
    combined.sort((a, b) => new Date(b.draw_date).getTime() - new Date(a.draw_date).getTime());

    res.json({ success: true, winners: combined });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch winners: ' + error.message });
  }
};

exports.getDrawHistory = async (req, res) => {
  try {
    // 1. Fetch Winners, Profiles, and Draws separately
    const [{ data: winners }, { data: profiles }, { data: draws }] = await Promise.all([
      supabaseAdmin.from('winners').select('*'),
      supabaseAdmin.from('user_profiles').select('id, full_name'),
      supabaseAdmin.from('draws').select('*')
    ]);

    // 2. Perform the Triple Atomic Merge in memory based on DRAWS
    const history = (draws || []).map(d => {
      const winner = (winners || []).find(w => w.draw_id === d.id);
      const profile = winner ? (profiles || []).find(p => p.id === winner.user_id) : null;
      
      return {
        id: d.id,
        draw_date: d.draw_date,
        status: winner ? winner.payment_status : 'Rolled Over',
        winner_name: profile ? profile.full_name : (d.rollover_amount > 0 ? 'No Grand Winner' : 'Anonymous Hero'),
        jackpot_amount: winner ? winner.amount : (d.rollover_amount || 0),
        tier: winner ? winner.prize_tier : 'Jackpot Rollover'
      };
    });

    // Sort by draw_date descending
    history.sort((a, b) => new Date(b.draw_date).getTime() - new Date(a.draw_date).getTime());

    res.json({ success: true, history });
  } catch (error) {
    console.error('[History Error]:', error);
    res.status(500).json({ success: false, error: 'Ledger retrieval failure: ' + error.message });
  }
};

exports.updateWinnerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { error } = await supabaseAdmin
      .from('winners')
      .update({ payment_status: status })
      .eq('id', id);

    if (error) throw error;

    // ── NOTIFICATIONS ON STATUS UPDATE ──────────────────────
    try {
      // Fetch winner details to get user email and prize info
      const { data: winner } = await supabaseAdmin
        .from('winners')
        .select('*, user_profiles(full_name)')
        .eq('id', id)
        .single();

      if (winner) {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(winner.user_id);
        if (authUser?.user?.email) {
          await emailService.sendStatusUpdateEmail(
            authUser.user.email,
            winner.user_profiles?.full_name || 'Hero',
            status,
            winner.amount
          );
        }
      }
    } catch (notifErr) {
      console.error('[Admin] Notification trigger failed:', notifErr);
    }

    res.json({ success: true, message: `Winner status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update winner status' });
  }
};

// ==========================================
// CHARITY MANAGEMENT (IMPACT HUB)
// ==========================================

exports.getCharities = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('charities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, charities: data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch charities' });
  }
};

exports.createCharity = async (req, res) => {
  try {
    const { name, description, website_url, logo_url } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Charity name is required' });

    // XSS Prevention: Only allow http/https
    const validateUrl = (url) => {
      if (!url) return true;
      try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch (e) {
        return false;
      }
    };

    if (!validateUrl(website_url) || !validateUrl(logo_url)) {
      return res.status(400).json({ success: false, error: 'Invalid URL protocol. Only http/https allowed.' });
    }

    const { data, error } = await supabaseAdmin
      .from('charities')
      .insert([{ name, description, website_url, logo_url, is_active: true }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, charity: data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create charity' });
  }
};

exports.updateCharity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, website_url, logo_url, is_active } = req.body;

    // XSS Prevention
    const validateUrl = (url) => {
      if (!url) return true;
      try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch (e) {
        return false;
      }
    };

    if (!validateUrl(website_url) || !validateUrl(logo_url)) {
      return res.status(400).json({ success: false, error: 'Invalid URL protocol.' });
    }

    const { data, error } = await supabaseAdmin
      .from('charities')
      .update({ name, description, website_url, logo_url, is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, charity: data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update charity' });
  }
};

exports.deleteCharity = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if any users are tied to this charity before deleting
    const { count } = await supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('charity_id', id);

    if (count > 0) {
      // Soft delete by setting is_active = false
      await supabaseAdmin.from('charities').update({ is_active: false }).eq('id', id);
      return res.json({ success: true, message: 'Charity deactivated (in use by users)' });
    }

    const { error } = await supabaseAdmin.from('charities').delete().eq('id', id);
    if (error) throw error;

    res.json({ success: true, message: 'Charity permanently deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete charity' });
  }
};
