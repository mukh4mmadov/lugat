import { supabase } from './supabase';

let currentUserId = null;

export function setCurrentSyncUserId(userId) {
  currentUserId = userId;
}

export function getCurrentSyncUserId() {
  return currentUserId;
}

export async function fetchServerProgress(userId) {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('data')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116' || /0 rows/i.test(error.message || '')) {
        return null;
      }
      console.error('Error fetching server progress:', error);
      return null;
    }
    return data?.data ?? null;
  } catch (err) {
    console.error('Exception fetching server progress:', err);
    return null;
  }
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
