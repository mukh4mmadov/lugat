import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id, session.user);
      } else {
        setProfile(null);
        setProfileComplete(false);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id, session.user);
        } else {
          setProfile(null);
          setProfileComplete(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId, user) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, birth_date')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
      setProfileComplete(true);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);

      const isMissingProfile = error.code === 'PGRST116' || /0 rows/i.test(error.message || '');
      if (isMissingProfile && user) {
        const metadata = user.user_metadata || {};
        const { first_name, last_name, birth_date } = metadata;

        if (first_name && last_name && birth_date) {
          try {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                first_name: first_name.trim(),
                last_name: last_name.trim(),
                birth_date: birth_date,
              });

            if (!insertError) {
              setProfile({
                first_name: first_name.trim(),
                last_name: last_name.trim(),
                birth_date,
              });
              setProfileComplete(true);
            } else {
              console.error('Error auto-creating profile:', insertError);
              setProfileComplete(false);
            }
          } catch (insertErr) {
            console.error('Exception auto-creating profile:', insertErr);
            setProfileComplete(false);
          }
        } else {
          setProfileComplete(false);
        }
      } else {
        setProfileComplete(false);
      }
    }
  };

  const completeProfile = async (profileData) => {
    if (!user) return { error: new Error('No user') };
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        ...profileData,
      });

    if (!error) {
      setProfile(profileData);
      setProfileComplete(true);
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    profile,
    profileComplete,
    loading,
    signOut,
    completeProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
