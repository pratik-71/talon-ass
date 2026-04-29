const { supabaseAdmin } = require('../config/supabase');

/**
 * GET /api/user/profile
 * Fetch the complete profile for the authenticated user
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch profile
    let { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    // ── FALLBACK: Create profile if missing ──
    if (!profile && !profileError) {
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: userId,
          full_name: req.user.user_metadata?.full_name || 'Hero',
          donation_percentage: req.user.user_metadata?.donation_percentage || 10,
          charity_id: req.user.user_metadata?.charity_id || null
        })
        .select('*')
        .single();
      
      if (createError) throw createError;
      profile = newProfile;
    } else if (profileError) {
      throw profileError;
    }

    res.json({ 
      success: true, 
      profile: {
        ...profile,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('[Profile Fetch Error]:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve profile data' });
  }
};

/**
 * PUT /api/user/profile
 * Update user profile (Name, Charity ID, Donation Percentage)
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, charityId, donationPercentage } = req.body;

    const updates = {};
    if (fullName) updates.full_name = fullName;
    if (charityId) updates.charity_id = charityId;
    if (donationPercentage !== undefined) updates.donation_percentage = donationPercentage;

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Also update Auth Metadata for consistency
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { 
        full_name: fullName || data.full_name,
        charity_id: charityId || data.charity_id,
        donation_percentage: donationPercentage || data.donation_percentage
      }
    });

    res.json({ success: true, message: 'Profile updated successfully', profile: data });
  } catch (error) {
    console.error('[Profile Update Error]:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
};
