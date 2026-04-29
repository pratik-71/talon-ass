const { supabaseAdmin } = require('../config/supabase');
const emailService = require('../services/emailService');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';


exports.getStats = async (req, res) => {
  try {
    const [usersRes, subsRes, winnersRes, scoresRes] = await Promise.all([
      supabaseAdmin.from('user_profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('subscriptions').select('status').eq('status', 'active'),
      supabaseAdmin.from('winners').select('amount'),
      supabaseAdmin.from('scores').select('*', { count: 'exact', head: true })
    ]);

    const totalUsers = usersRes.count || 0;
    const activeSubs = subsRes.data?.length || 0;
    const totalWon = winnersRes.data?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;
    const totalScores = scoresRes.count || 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeSubscribers: activeSubs,
        prizePool: totalWon > 0 ? totalWon : 4500,
        charityImpact: totalUsers * 12.50,
        totalScores
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to aggregate stats' });
  }
};

/**
 * GET /api/admin/users
 */
exports.getUsers = async (req, res) => {
  try {
    const [{ data: profiles }, { data: subs }, { data: scores }] = await Promise.all([
      supabaseAdmin.from('user_profiles').select('id, full_name, created_at'),
      supabaseAdmin.from('subscriptions').select('user_id, status, plan_id'),
      supabaseAdmin.from('scores').select('user_id')
    ]);

    const formatted = profiles.map(profile => {
      const sub = subs?.find(s => s.user_id === profile.id);
      return {
        id: profile.id,
        name: profile.full_name || 'Anonymous Hero',
        email: '********@talon.com', // Masked for UI
        status: sub?.status || 'inactive',
        plan: sub?.plan_id || 'N/A',
        periodEnd: sub?.current_period_end || null,
        scoreCount: scores?.filter(s => s.user_id === profile.id).length || 0,
        joined: profile.created_at
      };
    });

    res.json({ success: true, users: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
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

    const { data, error } = await supabaseAdmin
      .from('scores')
      .update({ score: Number(score), date })
      .eq('id', scoreId)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Score updated by Admin', score: data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update score' });
  }
};

/**
 * PUT /api/admin/users/:id/subscription
 * Toggle a user's subscription status manually
 */
exports.toggleUserSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' or 'inactive'

    // Upsert into subscriptions table
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .upsert({ 
        user_id: id, 
        status: status,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: `Subscription marked as ${status}`, subscription: data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to toggle subscription' });
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
      supabaseAdmin.from('user_profiles').select('full_name').eq('id', selectedUserId).single()
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
    
    // Simulate probability: 30% chance there is NO 5-match winner this month
    const noGrandWinner = Math.random() < 0.3;
    const currentRollover = noGrandWinner ? tier5MatchTotal : 0;

    if (simulation) {
      // In Simulation Mode, return the calculated logic
      return res.json({ 
        success: true, 
        message: 'Simulation completed successfully',
        summary: {
          drawId: 'SIM_' + Date.now().toString().slice(-6),
          notifiedHero: noGrandWinner ? 'No Grand Winner (Rollover Triggered)' : (profile?.full_name || 'Anonymous Hero'),
          logicUsed: logic,
          prizePool: {
            basePool,
            previousRollover,
            tier5MatchTotal: Math.round(tier5MatchTotal),
            rolledForward: currentRollover > 0
          },
          isSimulation: true
        }
      });
    }

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
        notifiedHero: profile?.full_name || 'Anonymous Hero',
        heroEmail: selectedAuthUser.email,
        logicUsed: logic,
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

    const combined = winners.map(w => ({
      ...w,
      user_profiles: profiles.find(p => p.id === w.user_id) || { full_name: 'Anonymous Hero' }
    }));

    // Sort by created_at descending (latest first)
    combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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
        date: d.draw_date,
        status: winner ? winner.payment_status : 'Rolled Over',
        winnerName: profile ? profile.full_name : (d.rollover_amount > 0 ? 'No Grand Winner' : 'Anonymous Hero'),
        prize: winner ? winner.amount : d.rollover_amount,
        tier: winner ? winner.prize_tier : 'Jackpot Rollover'
      };
    });

    // Sort by date descending
    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

    // ── EMAIL NOTIFICATION ON APPROVAL ──────────────────────
    if (status === 'paid') {
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
            await emailService.sendWinnerEmail(
              authUser.user.email,
              winner.user_profiles?.full_name || 'Hero',
              winner.prize_tier,
              winner.amount,
              `${FRONTEND_URL}/messages` // Point to inbox for next steps
            );
          }
        }
      } catch (emailErr) {
        console.error('[Admin] Email trigger failed after status update:', emailErr);
      }
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
