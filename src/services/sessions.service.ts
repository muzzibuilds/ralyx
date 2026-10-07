/**
 * Session Service
 * Database operations for weekly sessions and attendance planning
 */

import { supabase } from '../lib/supabase';
import type { Session } from '../types';

export const sessionService = {
  /**
   * Create a new session
   */
  async createSession(session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('sessions')
      .insert([
        {
          season_id: session.seasonId,
          week_number: session.weekNumber,
          session_date: session.sessionDate.toISOString(),
          status: session.status,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all sessions for a season
   */
  async getSeasonSessions(seasonId: string) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('season_id', seasonId)
      .order('week_number', { ascending: true })
      .order('session_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get a single session
   */
  async getSession(id: string) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update session details
   */
  async updateSession(
    id: string,
    updates: Partial<Omit<Session, 'id' | 'createdAt' | 'updatedAt'>>,
  ) {
    const { data, error } = await supabase
      .from('sessions')
      .update({
        ...(updates.weekNumber !== undefined && { week_number: updates.weekNumber }),
        ...(updates.sessionDate && { session_date: updates.sessionDate.toISOString() }),
        ...(updates.status && { status: updates.status }),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a session
   */
  async deleteSession(id: string) {
    const { error } = await supabase.from('sessions').delete().eq('id', id);
    if (error) throw error;
  },
};
