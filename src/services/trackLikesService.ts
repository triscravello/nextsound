import { supabase } from '@/services/supabaseClient';

export async function fetchLikeCounts(trackIds: string[]): Promise<Record<string, number>> {
  if (trackIds.length === 0) return {};

  const { data, error } = await supabase
    .from('track_likes')
    .select('track_id, like_count')
    .in('track_id', trackIds);

  if (error) throw error;

  const counts: Record<string, number> = {};
  for (const id of trackIds) {
    counts[id] = 0;
  }
  for (const row of data ?? []) {
    counts[row.track_id] = row.like_count;
  }
  return counts;
}

export async function fetchUserLikedTrackIds(trackIds: string[]): Promise<Record<string, boolean>> {
  if (trackIds.length === 0) return {};

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};

  const { data, error } = await supabase
    .from('user_track_likes')
    .select('track_id')
    .eq('user_id', user.id)
    .in('track_id', trackIds);

  if (error) throw error;

  const liked: Record<string, boolean> = {};
  for (const id of trackIds) {
    liked[id] = false;
  }
  for (const row of data ?? []) {
    liked[row.track_id] = true;
  }
  return liked;
}

export async function fetchAllUserLikedTrackIds(): Promise<Record<string, boolean>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};

  const { data, error } = await supabase
    .from('user_track_likes')
    .select('track_id')
    .eq('user_id', user.id);

  if (error) throw error;

  const liked: Record<string, boolean> = {};
  for (const row of data ?? []) {
    liked[row.track_id] = true;
  }
  return liked;
}

export async function incrementTrackLike(trackId: string): Promise<number> {
  const { data, error } = await supabase.rpc('increment_track_like', {
    p_track_id: trackId,
  });

  if (error) throw error;
  return data as number;
}

export async function decrementTrackLike(trackId: string): Promise<number> {
  const { data, error } = await supabase.rpc('decrement_track_like', {
    p_track_id: trackId,
  });

  if (error) throw error;
  return data as number;
}
