/**
 * Season Service
 * Database operations for seasons
 */

import { supabase } from '../lib/supabase';
import type { Season } from '../types';

export const seasonService = {
  /**
   * Create a new season
   */
  async createSeason(season: Omit<Season, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('seasons')
      .insert([
        {
          name: season.name,
          location: season.location,
          start_date: season.startDate.toISOString(),
          end_date: season.endDate.toISOString(),
          capacity: season.capacity,
          min_dupr_rating: season.minDuprRating,
          registration_price: season.registrationPrice,
          registration_open_date: season.registrationOpenDate?.toISOString(),
          registration_close_date: season.registrationCloseDate?.toISOString(),
          status: season.status,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get season by ID
   */
  async getSeason(id: string) {
    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all seasons
   */
  async getSeasons() {
    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get current/active season
   */
  async getCurrentSeason() {
    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .in('status', ['open', 'in_progress'])
      .order('start_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Update season
   */
  async updateSeason(id: string, updates: Partial<Omit<Season, 'id' | 'createdAt' | 'updatedAt'>>) {
    const { data, error } = await supabase
      .from('seasons')
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.location && { location: updates.location }),
        ...(updates.startDate && { start_date: updates.startDate.toISOString() }),
        ...(updates.endDate && { end_date: updates.endDate.toISOString() }),
        ...(updates.capacity && { capacity: updates.capacity }),
        ...(updates.minDuprRating && { min_dupr_rating: updates.minDuprRating }),
        ...(updates.registrationPrice !== undefined && { registration_price: updates.registrationPrice }),
        ...(updates.status && { status: updates.status }),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update season status
   */
  async updateSeasonStatus(id: string, status: Season['status']) {
    const { data, error } = await supabase
      .from('seasons')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete season
   */
  async deleteSeason(id: string) {
    const { error } = await supabase.from('seasons').delete().eq('id', id);
    if (error) throw error;
  },
};
