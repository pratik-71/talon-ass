// Auth Controller - Handles authentication logic
const supabase = require('../config/supabase');

exports.register = async (req, res) => {
  try {
    const { email, password, fullName, donation, charityId } = req.body;
    
    if (!email || !password || !fullName || !charityId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: email, password, full name, and charity selection are mandatory.' 
      });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          donation_percentage: donation,
          charity_id: charityId
        }
      }
    });
    
    if (error) {
      if (error.message.includes('User already registered')) {
        return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
      }
      throw error;
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Account created successfully! Please check your email for verification.',
      data: data.user 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message || 'Registration failed. Please try again.' });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }
      throw error;
    }

    // ── Fetch Subscription Status ──────────────────────────────
    // Immediately check their status so the frontend is up-to-date
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, plan_id')
      .eq('user_id', data.user.id)
      .maybeSingle();
    
    res.status(200).json({ 
      success: true, 
      message: 'Welcome back to Talon!',
      session: {
        ...data.session,
        user: {
          ...data.session.user,
          subscription_status: subscription?.status || 'inactive',
          plan_type: subscription?.plan_id?.includes('yearly') ? 'yearly' : 'monthly'
        }
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, error: error.message || 'Login failed. Please check your credentials.' });
  }
};

exports.getProfile = async (req, res) => {
  // Logic for getting user profile
  res.status(200).json({ success: true, data: { user: req.user } });
};
