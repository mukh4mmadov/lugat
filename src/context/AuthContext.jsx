import {
  createContext,
  useMemo,
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { supabase, timeoutSignal } from "../lib/supabase";
import { useDispatch } from "react-redux";
import { fetchServerProgress, setCurrentSyncUserId } from "../lib/progressSync";
import { notifyAdmins } from "../lib/growth";
import { hasProgress, mergeProgress } from "../lib/progressMerge";
import { PROGRESS_OWNER_KEY, hydrateProgress, progressUpdatedAt, resetProgress, saveProgressNow, store } from "../store";
// TOPIK data is large, so its sync code loads only after sign-in.
const topikAttempts = () => import("../lib/topikAttempts");

const AuthContext = createContext(null);

// The last loaded profile, so a signed-in learner can keep studying when the
// profile request fails on a bad connection instead of waiting on a loader.
const PROFILE_CACHE_KEY = "k-talim:profile:v1";

function readCachedProfile(userId) {
  try {
    const cached = JSON.parse(localStorage.getItem(PROFILE_CACHE_KEY) || "null");
    return cached?.userId === userId ? cached.profile : null;
  } catch {
    return null;
  }
}

function cacheProfile(userId, profile) {
  try {
    if (profile) localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({ userId, profile }));
    else localStorage.removeItem(PROFILE_CACHE_KEY);
  } catch {
    // Storage is optional.
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const hasSyncedRef = useRef(false);
  const profileRequestRef = useRef(null);
  const syncRetryRef = useRef(0);

  const syncProgressOnLogin = useCallback(
    async (userId) => {
      try {
        const serverData = await fetchServerProgress(userId);
        syncRetryRef.current = 0;
        const local = store.getState().progress;
        const owner = localStorage.getItem(PROGRESS_OWNER_KEY);
        // Progress left on this device by another account is never mixed in.
        const localIsMine = !owner || owner === userId;
        const localCounts = localIsMine && hasProgress(local);
        setCurrentSyncUserId(userId);
        if (serverData) {
          dispatch(hydrateProgress(localCounts ? mergeProgress(local, serverData, progressUpdatedAt()) : serverData));
        } else if (!localIsMine) {
          dispatch(resetProgress());
        }
        localStorage.setItem(PROGRESS_OWNER_KEY, userId);
        // Guest or offline progress goes up right away.
        if (localCounts) saveProgressNow();
        topikAttempts().then((module) => module.syncTopikAttempts(userId));
      } catch (err) {
        // Leave server saving off and try again shortly.
        console.error("Error syncing progress on login:", err);
        if (syncRetryRef.current < 5) {
          syncRetryRef.current += 1;
          setTimeout(async () => {
            // Only if the same user is still signed in.
            const { data } = await supabase.auth.getSession();
            if (data.session?.user.id === userId) syncProgressOnLogin(userId);
          }, 15000 * syncRetryRef.current);
        }
      }
    },
    [dispatch],
  );

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          const complete = await fetchProfile(session.user.id, session.user);
          if (complete) {
            // Progress loads in the background. Saving to the server only
            // starts once it has loaded, so local data can't overwrite it.
            hasSyncedRef.current = true;
            syncProgressOnLogin(session.user.id);
          }
        } else {
          setProfile(null);
          setProfileComplete(false);
          hasSyncedRef.current = false;
        }
      })
      .catch((error) => {
        console.error("Error checking the current session:", error);
      })
      .finally(() => {
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // A token refresh changes nothing that needs the profile reloaded.
        if (event === "TOKEN_REFRESHED") return;
        // Supabase holds its auth lock while this callback runs, so awaiting
        // another Supabase call here deadlocks (e.g. on a token refresh).
        // Run the follow-up queries after the callback returns.
        setTimeout(async () => {
          const complete = await fetchProfile(session.user.id, session.user);
          if (complete && event === "SIGNED_IN" && !hasSyncedRef.current) {
            hasSyncedRef.current = true;
            await syncProgressOnLogin(session.user.id);
          }
        }, 0);
      } else {
        setProfile(null);
        setProfileComplete(false);
        setCurrentSyncUserId(null);
        cacheProfile(null, null);
        hasSyncedRef.current = false;
      }
    });

    return () => subscription.unsubscribe();
    // fetchProfile only touches refs and state setters; subscribing once is intended.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncProgressOnLogin]);

  // The initial session check and the auth listener both load the profile
  // right after sign-in; share one request so they can't race each other.
  const fetchProfile = (userId, user) => {
    if (profileRequestRef.current?.userId === userId) return profileRequestRef.current.promise;
    const promise = loadProfile(userId, user).finally(() => {
      if (profileRequestRef.current?.promise === promise) profileRequestRef.current = null;
    });
    profileRequestRef.current = { userId, promise };
    return promise;
  };

  const loadProfile = async (userId, user) => {
    let isComplete = false;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, birth_year")
        .eq("id", userId)
        .abortSignal(timeoutSignal())
        .maybeSingle();

      if (error) throw error;
      // No row yet: handled below like PostgREST's "0 rows" error.
      if (!data) throw Object.assign(new Error("0 rows"), { code: "PGRST116" });
      setProfile(data);
      cacheProfile(userId, data);
      setProfileComplete(true);
      isComplete = true;
    } catch (error) {
      setProfile(null);

      const isMissingProfile =
        error.code === "PGRST116" || /0 rows/i.test(error.message || "");
      if (!isMissingProfile) {
        // A network or server error says nothing about whether the profile
        // exists; don't send an existing learner to "complete your profile".
        console.error("Error fetching profile:", error);
        setProfile(readCachedProfile(userId));
        setProfileComplete(true);
        return true;
      }
      if (user) {
        const metadata = user.user_metadata || {};
        const fullName = String(metadata.full_name || metadata.name || "").trim();
        const firstName = String(metadata.first_name || metadata.given_name || fullName.split(/\s+/)[0] || "").trim();
        const lastName = String(metadata.last_name || metadata.family_name || fullName.split(/\s+/).slice(1).join(" ") || "").trim();
        const birthYear = metadata.birth_date ? Number(String(metadata.birth_date).split("-")[0]) || null : null;

        if (firstName) {
          try {
            const created = { first_name: firstName.slice(0, 50), last_name: lastName.slice(0, 50), birth_year: birthYear };
            const { error: insertError } = await supabase.from("profiles").upsert({ id: userId, ...created });

            if (!insertError) {
              notifyAdmins();
              setProfile(created);
              cacheProfile(userId, created);
              setProfileComplete(true);
              isComplete = true;
            } else {
              console.error("Error auto-creating profile:", insertError);
              setProfileComplete(false);
            }
          } catch (insertErr) {
            console.error("Exception auto-creating profile:", insertErr);
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
    if (!user) return { error: new Error("No user") };
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      ...profileData,
    });

    if (!error) {
      notifyAdmins();
      setProfile(profileData);
      setProfileComplete(true);
      await syncProgressOnLogin(user.id);
      hasSyncedRef.current = true;
    }

    return { error };
  };

  const updateProfile = async (profileData) => {
    if (!user) return { error: new Error("No user") };
    const { error } = await supabase
      .from("profiles")
      .update(profileData)
      .eq("id", user.id);
    if (!error) setProfile((current) => ({ ...current, ...profileData }));
    return { error };
  };

  // Signing out saves the latest progress, then leaves this device as a
  // fresh guest: the account's progress stays safe on the server.
  const signOut = async () => {
    await Promise.all([saveProgressNow(), topikAttempts().then((module) => module.stopTopikSync())]);
    await supabase.auth.signOut();
    setCurrentSyncUserId(null);
    dispatch(resetProgress());
    localStorage.removeItem(PROGRESS_OWNER_KEY);
  };

  // The stored session can carry an old copy of the user; reload it so
  // changes made by an admin (such as premium) show up without signing out.
  const refreshUser = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) setUser((current) => (current?.id === data.user.id ? data.user : current));
  }, []);

  useEffect(() => {
    if (user?.id) refreshUser().catch(() => {});
  }, [user?.id, refreshUser]);

  const value = useMemo(
    () => ({ user, session, profile, profileComplete, loading, signOut, completeProfile, updateProfile, refreshUser }),
    // The functions are recreated each render but only read current state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, session, profile, profileComplete, loading, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
