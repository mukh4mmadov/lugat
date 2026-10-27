import { supabase, timeoutSignal } from './supabase';

let currentUserId = null;

export function setCurrentSyncUserId(userId) {
  currentUserId = userId;
}

export function getCurrentSyncUserId() {
  return currentUserId;
}

// Resolves to the saved progress, or null when the user has none yet.
// Throws when the request fails: "unknown" must not be mistaken for "none",
// or the empty local progress would be saved over the real one.
export async function fetchServerProgress(userId) {
  const { data, error } = await supabase
    .from('user_progress')
    .select('data')
    .eq('user_id', userId)
    .abortSignal(timeoutSignal())
    .maybeSingle();

  if (error) throw error;
  return data?.data ?? null;
}

export async function saveServerProgress(userId, progressData) {
  try {
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        data: progressData,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving server progress:', error);
      return { error };
    }
    return { error: null };
  } catch (err) {
    console.error('Exception saving server progress:', err);
    return { error: err };
  }
}
