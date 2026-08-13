import { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useDispatch } from 'react-redux';
import { setCurrentSyncUserId } from '../lib/progressSync';
import { store, hydrateProgress } from '../store';
import { fetchServerProgress, saveServerProgress } from '../lib/progressSync';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [pendingProgressImport, setPendingProgressImport] = useState(false);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const hasSyncedRef = useRef(false);

  const syncProgressOnLogin = useCallback(async (userId) => {
    try {
      const serverData = await fetchServerProgress(userId);
      if (serverData) {
        dispatch(hydrateProgress(serverData));
        setCurrentSyncUserId(userId);
      } else {
        const localProgress = store.getState().progress;
        const hasLocalProgress = Object.keys(localProgress.words).length > 0
          || localProgress.stats.studiedWords > 0
          || Object.keys(localProgress.favorites).length > 0
          || localProgress.stats.activity.length > 0;
        if (hasLocalProgress) {
          setPendingProgressImport(true);
        } else {
          setCurrentSyncUserId(userId);
        }
      }
    } catch (err) {
      console.error('Error syncing progress on login:', err);
    }
  }, [dispatch]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const complete = await fetchProfile(session.user.id, session.user);
        if (complete) {
          await syncProgressOnLogin(session.user.id);
          hasSyncedRef.current = true;
        }
      } else {
        setProfile(null);
        setProfileComplete(false);
        setPendingProgressImport(false);
        hasSyncedRef.current = false;
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const complete = await fetchProfile(session.user.id, session.user);
          if (complete && event === 'SIGNED_IN' && !hasSyncedRef.current) {
            await syncProgressOnLogin(session.user.id);
            hasSyncedRef.current = true;
          }
        } else {
          setProfile(null);
          setProfileComplete(false);
          setPendingProgressImport(false);
          setCurrentSyncUserId(null);
          hasSyncedRef.current = false;
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [syncProgressOnLogin]);

  const fetchProfile = async (userId, user) => {
    let isComplete = false;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, birth_year')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
      setProfileComplete(true);
      isComplete = true;
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);

      const isMissingProfile = error.code === 'PGRST116' || /0 rows/i.test(error.message || '');
      if (isMissingProfile && user) {
        const metadata = user.user_metadata || {};
        const { first_name, last_name, birth_date: birthDateStr } = metadata;

        if (first_name && last_name && birthDateStr) {
          try {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                first_name: first_name.trim(),
                last_name: last_name.trim(),
                birth_year: Number(birthDateStr.split('-')[0]),
              });

            if (!insertError) {
              setProfile({
                first_name: first_name.trim(),
                last_name: last_name.trim(),
                birth_year: Number(birthDateStr.split('-')[0]),
              });
              setProfileComplete(true);
              isComplete = true;
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
    return isComplete;
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
      await syncProgressOnLogin(user.id);
      hasSyncedRef.current = true;
    }

    return { error };
  };

  const resolveProgressImport = async (shouldImport) => {
    if (!user) return;
    if (shouldImport) {
      const localProgress = store.getState().progress;
      const result = await saveServerProgress(user.id, localProgress);
      if (result.error) {
        console.error('Error resolving progress import:', result.error);
      }
    }
    setPendingProgressImport(false);
    setCurrentSyncUserId(user.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setCurrentSyncUserId(null);
  };

  const value = {
    user,
    session,
    profile,
    profileComplete,
    pendingProgressImport,
    loading,
    signOut,
    completeProfile,
    resolveProgressImport,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
