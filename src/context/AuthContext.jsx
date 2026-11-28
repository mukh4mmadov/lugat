import {
  createContext,
  useMemo,
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { isAuthRetryableFetchError } from "@supabase/supabase-js";
import { supabase, timeoutSignal } from "../lib/supabase";
import { isViewingAs, stopViewAs, viewAs } from "../lib/viewAs";
import { useDispatch } from "react-redux";
import { fetchServerProgress, setCurrentSyncUserId } from "../lib/progressSync";
import { notifyAdmins } from "../lib/growth";
import { hasProgress, mergeProgress } from "../lib/progressMerge";
import { PROGRESS_OWNER_KEY, hydrateProgress, progressUpdatedAt, resetProgress, saveProgressNow, store } from "../store";
const topikAttempts = () => import("../lib/topikAttempts");

const AuthContext = createContext(null);

const PROFILE_CACHE_KEY = "k-talim:profile:v1";

function readCachedProfile(userId) {
  try {
    const cached = JSON.parse(localStorage.getItem(PROFILE_CACHE_KEY) || "null");
    return cached?.userId === userId ? cached.profile : null;
  } catch {
    return null;
  }
}

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(supabase.auth.storageKey) || "null")?.user ?? null;
  } catch {
    return null;
  }
}

function sameUser(a, b) {
  if (!a || !b) return a === b;
  if (a.id !== b.id || a.updated_at !== b.updated_at) return false;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

function cacheProfile(userId, profile) {
  try {
    if (profile) localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({ userId, profile }));
    else localStorage.removeItem(PROFILE_CACHE_KEY);
  } catch {
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
  const currentUserIdRef = useRef(null);
  currentUserIdRef.current = user?.id ?? null;

  const syncProgressOnLogin = useCallback(
    async (userId) => {
      try {
        const serverData = await fetchServerProgress(userId);
        syncRetryRef.current = 0;
        const local = store.getState().progress;
        const owner = localStorage.getItem(PROGRESS_OWNER_KEY);
        const localIsMine = !owner || owner === userId;
        const localCounts = localIsMine && hasProgress(local);
        setCurrentSyncUserId(userId);
        if (serverData) {
          dispatch(hydrateProgress(localCounts ? mergeProgress(local, serverData, progressUpdatedAt()) : serverData));
        } else if (!localIsMine) {
          dispatch(resetProgress());
        }
        localStorage.setItem(PROGRESS_OWNER_KEY, userId);
        if (localCounts) saveProgressNow();
        topikAttempts().then((module) => module.syncTopikAttempts(userId));
      } catch (err) {
        console.error("Error syncing progress on login:", err);
        if (syncRetryRef.current < 5) {
          syncRetryRef.current += 1;
          setTimeout(async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session?.user.id === userId) syncProgressOnLogin(userId);
          }, 15000 * syncRetryRef.current);
        }
      }
    },
    [dispatch],
  );

  useEffect(() => {
    if (!isViewingAs) return;
    const learner = viewAs.user;
    setUser(learner);
    setProfileComplete(true);
    (async () => {
      try {
        const [{ data }, serverData] = await Promise.all([
          supabase.from("profiles").select("first_name, last_name, birth_year").eq("id", learner.id).maybeSingle(),
          fetchServerProgress(learner.id),
        ]);
        setProfile(data || null);
        dispatch(serverData ? hydrateProgress(serverData) : resetProgress());
      } catch (error) {
        console.error("Error loading the learner's view:", error);
      }
      topikAttempts().then((module) => module.syncTopikAttempts(learner.id));
      setLoading(false);
    })();
  }, [dispatch]);

  useEffect(() => {
    if (isViewingAs) return undefined;
    supabase.auth
      .getSession()
      .then(async ({ data: { session }, error }) => {
        if (!session && isAuthRetryableFetchError(error)) {
          const storedUser = readStoredUser();
          if (storedUser) {
            setUser(storedUser);
            setProfile(readCachedProfile(storedUser.id));
            setProfileComplete(true);
            return;
          }
        }
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          const complete = await fetchProfile(session.user.id, session.user);
          if (complete && !hasSyncedRef.current) {
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
      if (event === "INITIAL_SESSION") return;
      setSession((current) => (current && session && current.access_token === session.access_token ? current : session));
      setUser((current) => (sameUser(current, session?.user) ? current : session?.user ?? null));

      if (session?.user) {
        if ((event === "TOKEN_REFRESHED" || event === "SIGNED_IN") && hasSyncedRef.current && currentUserIdRef.current === session.user.id) return;
        setTimeout(async () => {
          const complete = await fetchProfile(session.user.id, session.user);
          if (complete && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && !hasSyncedRef.current) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncProgressOnLogin]);

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
    if (!user || isViewingAs) return { error: new Error("No user") };
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
    if (!user || isViewingAs) return { error: new Error("No user") };
    const { error } = await supabase
      .from("profiles")
      .update(profileData)
      .eq("id", user.id);
    if (!error) setProfile((current) => ({ ...current, ...profileData }));
    return { error };
  };

  const signOut = async () => {
    if (isViewingAs) return stopViewAs();
    await Promise.all([saveProgressNow(), topikAttempts().then((module) => module.stopTopikSync())]);
    await supabase.auth.signOut();
    try {
      await window.caches?.delete("topik-premium-v1");
    } catch {
    }
    setCurrentSyncUserId(null);
    dispatch(resetProgress());
    localStorage.removeItem(PROGRESS_OWNER_KEY);
  };

  const refreshUser = useCallback(async () => {
    if (isViewingAs) return;
    const { data } = await supabase.auth.getUser();
    if (data?.user) setUser((current) => (current?.id === data.user.id ? data.user : current));
  }, []);

  useEffect(() => {
    if (user?.id) refreshUser().catch(() => {});
  }, [user?.id, refreshUser]);

  useEffect(() => {
    if (user?.id) navigator.storage?.persist?.().catch(() => {});
  }, [user?.id]);

  const value = useMemo(
    () => ({ user, session, profile, profileComplete, loading, signOut, completeProfile, updateProfile, refreshUser }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, session, profile, profileComplete, loading, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
