import { supabase } from '@/integrations/supabase/client';

/**
 * Utility function to promote a user to admin status
 * This should only be used by existing admins or during initial setup
 */
export const promoteUserToAdmin = async (userEmail: string) => {
  try {
    // First, get the user ID from the profiles table using email
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .ilike('display_name', `%${userEmail.split('@')[0]}%`)
      .limit(1);

    if (profileError) {
      console.error('Error finding user profile:', profileError);
      return { error: 'User not found' };
    }

    if (!profiles || profiles.length === 0) {
      return { error: 'User not found. Please ensure the user has signed up first.' };
    }

    const userId = profiles[0].user_id;

    // Check if user already has admin role
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing role:', checkError);
      return { error: 'Error checking user role' };
    }

    if (existingRole) {
      return { error: 'User is already an admin' };
    }

    // Add admin role
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'admin'
      });

    if (insertError) {
      console.error('Error promoting user to admin:', insertError);
      return { error: 'Failed to promote user to admin' };
    }

    return { success: true, message: 'User successfully promoted to admin' };
  } catch (error) {
    console.error('Error in promoteUserToAdmin:', error);
    return { error: 'An unexpected error occurred' };
  }
};

/**
 * Utility function to revoke admin status from a user
 */
export const revokeAdminStatus = async (userEmail: string) => {
  try {
    // First, get the user ID from the profiles table using email
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .ilike('display_name', `%${userEmail.split('@')[0]}%`)
      .limit(1);

    if (profileError) {
      console.error('Error finding user profile:', profileError);
      return { error: 'User not found' };
    }

    if (!profiles || profiles.length === 0) {
      return { error: 'User not found' };
    }

    const userId = profiles[0].user_id;

    // Remove admin role
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', 'admin');

    if (deleteError) {
      console.error('Error revoking admin status:', deleteError);
      return { error: 'Failed to revoke admin status' };
    }

    return { success: true, message: 'Admin status successfully revoked' };
  } catch (error) {
    console.error('Error in revokeAdminStatus:', error);
    return { error: 'An unexpected error occurred' };
  }
};