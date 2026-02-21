import { supabase } from './supabase';

export interface SupabaseUser {
  id: string;
  email: string;
  name: string;
  balance: number;
  createdAt: string;
  status: string;
  registrationStatus: string;
  updated_at: string;
}

/**
 * Register a new user in Supabase
 */
export async function registerUser(email: string, password: string, name: string, balance: number = 0): Promise<{ user: SupabaseUser; error: null } | { user: null; error: any }> {
  console.log('🚀 Starting Supabase registration for:', email);
  console.log('🚀 Name:', name);
  
  try {
    // 1. Create auth user in Supabase Auth
    console.log('💾 Creating Supabase Auth user...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        },
      },
    });

    if (authError) {
      console.error('❌ Supabase Auth error:', authError);
      console.error('   Error code:', authError.code);
      console.error('   Error message:', authError.message);
      return { user: null, error: authError };
    }

    if (!authData.user) {
      console.error('❌ No user returned from auth signup');
      return { user: null, error: new Error('No user created') };
    }

    const userId = authData.user.id;
    console.log('✅ Supabase Auth user created with ID:', userId);

    // 2. Save user profile to 'users' table
    console.log('💾 Inserting user profile to database...');
    console.log('   ID:', userId);
    console.log('   Email:', email);
    console.log('   Name:', name);
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          email,
          name: name || email.split('@')[0],
          balance: balance || 0,
          createdAt: new Date().toISOString(),
          status: 'active',
          registrationStatus: 'verified',
        },
      ])
      .select()
      .single();

    if (userError) {
      console.error('❌ Database INSERT error:', userError);
      console.error('   Error code:', userError.code);
      console.error('   Error message:', userError.message);
      console.error('   Error details:', userError.details);
      // DON'T delete auth user - user might want to try again
      return { user: null, error: userError };
    }

    if (!userData) {
      console.error('❌ No data returned from insert');
      return { user: null, error: new Error('Insert returned no data') };
    }

    console.log('✅ User profile saved successfully!');
    console.log('✅ Returned data:', userData);
    return { user: userData, error: null };
  } catch (err: any) {
    console.error('❌ Registration catch error:', err);
    console.error('   Error message:', err.message);
    console.error('   Error stack:', err.stack);
    return { user: null, error: err };
  }
}

/**
 * Login user with email and password
 */
export async function loginUser(email: string, password: string): Promise<{ user: SupabaseUser; error: null } | { user: null; error: any }> {
  console.log('🚀 Starting Supabase login for:', email);
  
  try {
    // 1. Sign in with Supabase Auth
    console.log('📄 Authenticating with Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('❌ Supabase Auth error:', authError);
      return { user: null, error: authError };
    }

    if (!authData.user) {
      console.error('❌ No user returned from auth login');
      return { user: null, error: new Error('Login failed') };
    }

    const userId = authData.user.id;
    console.log('✅ Supabase Auth login successful:', userId);

    // 2. Fetch user profile from 'users' table
    console.log('📄 Fetching user profile...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('❌ User profile fetch error:', userError);
      return { user: null, error: userError };
    }

    console.log('✅ User profile fetched:', userData);
    return { user: userData, error: null };
  } catch (err: any) {
    console.error('❌ Login error:', err.message);
    return { user: null, error: err };
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<SupabaseUser | null> {
  console.log('📄 Fetching user by ID:', id);
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ User fetch error:', error);
      return null;
    }

    console.log('✅ User fetched:', data);
    return data;
  } catch (err: any) {
    console.error('❌ Error fetching user:', err.message);
    return null;
  }
}

/**
 * Get all users
 */
export async function getAllUsers(): Promise<SupabaseUser[]> {
  console.log('📄 Fetching all users...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('❌ Users fetch error:', error);
      return [];
    }

    console.log('✅ Users fetched, count:', data?.length || 0);
    return data || [];
  } catch (err: any) {
    console.error('❌ Error fetching users:', err.message);
    return [];
  }
}

/**
 * Update user balance
 */
export async function updateUserBalance(userId: string, newBalance: number): Promise<SupabaseUser | null> {
  console.log('🚀 Updating balance for user:', userId, 'New balance:', newBalance);
  
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Balance update error:', error);
      return null;
    }

    console.log('✅ Balance updated:', data);
    return data;
  } catch (err: any) {
    console.error('❌ Error updating balance:', err.message);
    return null;
  }
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<boolean> {
  console.log('🚀 Logging out user...');
  
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Logout error:', error);
      return false;
    }

    console.log('✅ User logged out');
    return true;
  } catch (err: any) {
    console.error('❌ Logout error:', err.message);
    return false;
  }
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  console.log('📄 Getting current session...');
  
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Session fetch error:', error);
      return null;
    }

    if (data.session) {
      console.log('✅ Session found:', data.session.user?.id);
      return data.session;
    }

    console.log('ℹ️ No active session');
    return null;
  } catch (err: any) {
    console.error('❌ Error getting session:', err.message);
    return null;
  }
}
