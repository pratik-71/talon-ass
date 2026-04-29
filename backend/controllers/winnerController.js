const { supabaseAdmin } = require('../config/supabase');

/**
 * GET /api/winners/my-winnings
 * Fetch winnings for the authenticated user
 */
exports.getMyWinnings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabaseAdmin
      .from('winners')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, winners: data || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch your winnings' });
  }
};

/**
 * GET /api/winners/:id
 * Fetch a specific winner record (ownership check)
 */
exports.getWinnerById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const { data, error } = await supabaseAdmin
      .from('winners')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) return res.status(404).json({ success: false, error: 'Winner record not found' });
    
    res.json({ success: true, winner: data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Verification link invalid' });
  }
};

/**
 * POST /api/winners/:id/verify
 * Submit proof for a win
 */
exports.submitProof = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { proof_image } = req.body;

    if (!proof_image) return res.status(400).json({ success: false, error: 'Proof image is required' });

    // 1. Initial ownership check to prevent unauthorized storage uploads
    const { data: winner, error: ownerError } = await supabaseAdmin
      .from('winners')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (ownerError || !winner) {
      return res.status(404).json({ success: false, error: 'Winner record not found or access denied' });
    }

    let finalProofUrl = null;

    try {
      // Ensure the proofs bucket exists (ignore error if it already exists)
      await supabaseAdmin.storage.createBucket('proofs', { public: true }).catch(() => {});

      // Extract the base64 string
      const base64Data = proof_image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Determine file extension
      const mimeMatch = proof_image.match(/^data:image\/(\w+);base64,/);
      const extension = mimeMatch ? mimeMatch[1] : 'jpeg';
      
      const fileName = `proof_${id}_${Date.now()}.${extension}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabaseAdmin.storage
        .from('proofs')
        .upload(fileName, buffer, {
          contentType: `image/${extension}`,
          upsert: true
        });

      if (uploadError) throw new Error('Storage upload failed: ' + uploadError.message);

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage.from('proofs').getPublicUrl(fileName);
      finalProofUrl = urlData.publicUrl;

    } catch (storageErr) {
      console.error('[Storage Error]:', storageErr);
      return res.status(500).json({ success: false, error: 'Failed to upload image to storage' });
    }

    // Update winner record
    const { data, error } = await supabaseAdmin
      .from('winners')
      .update({ 
        proof_url: finalProofUrl, 
        payment_status: 'pending_review' // Transition state
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Proof submitted for review', winner: data });
  } catch (error) {
    console.error('[Submit Proof Error]:', error);
    res.status(500).json({ success: false, error: 'Failed to submit proof' });
  }
};
