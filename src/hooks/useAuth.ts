import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      console.log('Starting sign out process...');
      
      // Clear local state immediately
      setUser(null);
      setSession(null);
      
      // Clear any cached authentication data
      try {
        // Clear Supabase auth data from localStorage
        localStorage.removeItem('sb-mtypyrsdbsoxrgzsxwsk-auth-token');
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
      } catch (storageErr) {
        console.warn('Error clearing storage:', storageErr);
      }
      
      // Then attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.warn('Supabase sign out warning:', error.message);
        // Don't treat this as a failure - the local state is already cleared
      }
      
      console.log('Sign out completed successfully');
      return { error: null };
    } catch (err) {
      console.error('Sign out error:', err);
      // Still clear local state even if there's an error
      setUser(null);
      setSession(null);
      return { error: null };
    }
  };

  return {
    user,
    session,
    loading,
    signOut,
    isAuthenticated: !!user,
  };
};