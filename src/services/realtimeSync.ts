import { supabase, isSupabaseConfigured } from '../lib/supabase';

type RealtimeCallback = (table: string, eventType: string, payload: any) => void;

/**
 * Berlangganan perubahan data realtime dari Supabase
 */
export function subscribeToRealtimeChanges(onDataChanged: RealtimeCallback): () => void {
  if (!isSupabaseConfigured || !supabase) {
    return () => {};
  }

  const channel = supabase
    .channel('schema-db-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public' },
      (payload) => {
        onDataChanged(payload.table, payload.eventType, payload.new || payload.old);
      }
    )
    .subscribe();

  return () => {
    if (supabase) {
      supabase.removeChannel(channel);
    }
  };
}
