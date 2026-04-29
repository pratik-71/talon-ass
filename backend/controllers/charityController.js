const supabase = require('../config/supabase');

/**
 * @desc    Get all active charities
 * @route   GET /api/charities
 * @access  Public
 */
exports.getCharities = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('charities')
      .select('id, name, description, logo_url, website_url')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    res.status(200).json({ 
      success: true, 
      count: data.length,
      data 
    });
  } catch (error) {
    console.error('Error fetching charities:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve charities. Please try again later.' 
    });
  }
};
