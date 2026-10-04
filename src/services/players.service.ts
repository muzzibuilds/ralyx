/**
 * Player Service
 * Database operations for players
 */

import { supabase } from '../lib/supabase';
import type { Player } from '../types';

export const playerService = {
  /**
   * Create a new player
   */
  async createPlayer(player: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('players')
      .insert([
        {
          first_name: player.firstName,
          last_name: player.lastName,
          email: player.email,
          phone: player.phone,
          dupr_rating: player.duprRating,
          dupr_profile_url: player.duprProfileUrl,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get player by ID
   */
  async getPlayer(id: string) {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get player by email
   */
  async getPlayerByEmail(email: string) {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  },

  /**
   * Get all players (with optional limit/offset for pagination)
   */
  async getPlayers(limit?: number, offset?: number) {
    let query = supabase.from('players').select('*');

    if (limit) query = query.limit(limit);
    if (offset) query = query.range(offset, offset + (limit || 10) - 1);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Update player information
   */
  async updatePlayer(id: string, updates: Partial<Omit<Player, 'id' | 'createdAt' | 'updatedAt'>>) {
    const { data, error } = await supabase
      .from('players')
      .update({
        ...(updates.firstName && { first_name: updates.firstName }),
        ...(updates.lastName && { last_name: updates.lastName }),
        ...(updates.email && { email: updates.email }),
        ...(updates.phone && { phone: updates.phone }),
        ...(updates.duprRating && { dupr_rating: updates.duprRating }),
        ...(updates.duprProfileUrl && { dupr_profile_url: updates.duprProfileUrl }),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete player
   */
  async deletePlayer(id: string) {
    const { error } = await supabase.from('players').delete().eq('id', id);
    if (error) throw error;
  },
};
