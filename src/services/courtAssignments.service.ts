/**
 * Court Assignment Service
 * Manages per-session court groups and set rotations
 */

import { supabase } from '../lib/supabase';

export interface CourtAssignmentRecord {
  id: string;
  session_id: string;
  set_number: 1 | 2;
  court_number: 1 | 2 | 3 | 4;
  players: string[];
  status: 'scheduled' | 'in_progress' | 'completed';
}

export const courtAssignmentService = {
  async getSessionAssignments(sessionId: string) {
    const { data, error } = await supabase
      .from('court_assignments')
      .select('*')
      .eq('session_id', sessionId)
      .order('set_number', { ascending: true })
      .order('court_number', { ascending: true });

    if (error) throw error;
    return (data ?? []) as CourtAssignmentRecord[];
  },

  async replaceSessionAssignments(sessionId: string, groups: string[][]) {
    const { error: deleteError } = await supabase
      .from('court_assignments')
      .delete()
      .eq('session_id', sessionId);

    if (deleteError) throw deleteError;

    const records = groups.flatMap((players, index) => {
      const courtNumber = Math.min(index + 1, 4) as 1 | 2 | 3 | 4;

      return ([1, 2] as const).map((setNumber) => ({
        session_id: sessionId,
        set_number: setNumber,
        court_number: courtNumber,
        players,
        status: 'scheduled' as const,
      }));
    });

    if (records.length === 0) {
      return [] as CourtAssignmentRecord[];
    }

    const { data, error } = await supabase
      .from('court_assignments')
      .insert(records)
      .select('*');

    if (error) throw error;
    return (data ?? []) as CourtAssignmentRecord[];
  },
};
