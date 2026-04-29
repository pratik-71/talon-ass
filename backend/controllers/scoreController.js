const { supabaseAdmin: supabase } = require('../config/supabase');

const MAX_SCORES = 5;
const SCORE_MIN = 1;
const SCORE_MAX = 45;

/**
 * @desc    Get all scores for the authenticated user (latest 5, reverse chrono)
 * @route   GET /api/scores
 * @access  Private
 */
exports.getScores = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('scores')
      .select('id, score, date, created_at')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(MAX_SCORES);

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('[ScoreController] getScores error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch scores.' });
  }
};

/**
 * @desc    Add a new score (enforces rolling-5 logic and no duplicate dates)
 * @route   POST /api/scores
 * @access  Private
 */
exports.addScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { score, date } = req.body;

    // --- Validation ---
    if (!score || !date) {
      return res.status(400).json({ success: false, error: 'Score and date are required.' });
    }
    const numScore = Number(score);
    if (isNaN(numScore) || numScore < SCORE_MIN || numScore > SCORE_MAX) {
      return res.status(400).json({
        success: false,
        error: `Score must be a number between ${SCORE_MIN} and ${SCORE_MAX} (Stableford format).`,
      });
    }

    // --- Check for duplicate date ---
    const { data: existingByDate, error: dupError } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (dupError) throw dupError;
    if (existingByDate) {
      return res.status(409).json({
        success: false,
        error: 'A score for this date already exists. Please edit or delete the existing entry.',
      });
    }

    // --- Get current scores ordered by date ASC (oldest first) ---
    const { data: existing, error: fetchError } = await supabase
      .from('scores')
      .select('id, date')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (fetchError) throw fetchError;

    // --- Rolling 5: delete oldest if already at MAX ---
    if (existing.length >= MAX_SCORES) {
      const oldest = existing[0];
      const { error: deleteError } = await supabase
        .from('scores')
        .delete()
        .eq('id', oldest.id);
      if (deleteError) throw deleteError;
    }

    // --- Insert new score ---
    const { data: inserted, error: insertError } = await supabase
      .from('scores')
      .insert({ user_id: userId, score: numScore, date })
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json({ success: true, message: 'Score added successfully.', data: inserted });
  } catch (error) {
    console.error('[ScoreController] addScore error:', error);
    res.status(500).json({ success: false, error: 'Failed to add score. Please try again.' });
  }
};

/**
 * @desc    Edit an existing score by ID
 * @route   PUT /api/scores/:id
 * @access  Private
 */
exports.editScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { score, date } = req.body;

    // --- Validate score ---
    if (score !== undefined) {
      const numScore = Number(score);
      if (isNaN(numScore) || numScore < SCORE_MIN || numScore > SCORE_MAX) {
        return res.status(400).json({
          success: false,
          error: `Score must be between ${SCORE_MIN} and ${SCORE_MAX}.`,
        });
      }
    }

    // --- Check ownership ---
    const { data: existing, error: ownerError } = await supabase
      .from('scores')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (ownerError) throw ownerError;
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Score not found or not yours.' });
    }

    // --- Check duplicate date (excluding this record) ---
    if (date) {
      const { data: dupDate, error: dupError } = await supabase
        .from('scores')
        .select('id')
        .eq('user_id', userId)
        .eq('date', date)
        .neq('id', id)
        .maybeSingle();

      if (dupError) throw dupError;
      if (dupDate) {
        return res.status(409).json({
          success: false,
          error: 'Another score for this date already exists.',
        });
      }
    }

    const updates = {};
    if (score !== undefined) updates.score = Number(score);
    if (date !== undefined) updates.date = date;

    const { data: updated, error: updateError } = await supabase
      .from('scores')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json({ success: true, message: 'Score updated.', data: updated });
  } catch (error) {
    console.error('[ScoreController] editScore error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to update score.' });
  }
};

/**
 * @desc    Delete a score by ID
 * @route   DELETE /api/scores/:id
 * @access  Private
 */
exports.deleteScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // --- Check ownership ---
    const { data: existing, error: ownerError } = await supabase
      .from('scores')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (ownerError) throw ownerError;
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Score not found or not yours.' });
    }

    const { error: deleteError } = await supabase.from('scores').delete().eq('id', id);
    if (deleteError) throw deleteError;

    res.status(200).json({ success: true, message: 'Score deleted.' });
  } catch (error) {
    console.error('[ScoreController] deleteScore error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to delete score.' });
  }
};
