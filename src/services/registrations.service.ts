/**
 * Registration Service
 * Database operations for player registrations
 */

import { supabase } from '../lib/supabase';
import type { Registration, RegistrationStatus } from '../types';

export const registrationService = {
  /**
   * Create a new registration
   */
  async createRegistration(registration: Omit<Registration, 'id'>) {
    const { data, error } = await supabase
      .from('registrations')
      .insert([
        {
          player_id: registration.playerId,
          season_id: registration.seasonId,
          status: registration.status,
          registered_at: registration.registeredAt,
          paid_at: registration.paidAt,
          amount: registration.amount,
          stripe_session_id: registration.stripeSessionId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get registration by ID
   */
  async getRegistration(id: string) {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get registrations by season
   */
  async getRegistrationsBySeason(seasonId: string, status?: RegistrationStatus) {
    let query = supabase
      .from('registrations')
      .select('*, players(*)')
      .eq('season_id', seasonId);

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Get confirmed registrations count for a season
   */
  async getConfirmedCount(seasonId: string) {
    const { count, error } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('season_id', seasonId)
      .eq('status', 'confirmed');

    if (error) throw error;
    return count || 0;
  },

  /**
   * Get registrations by player
   */
  async getPlayerRegistrations(playerId: string) {
    const { data, error } = await supabase
      .from('registrations')
      .select('*, seasons(*)')
      .eq('player_id', playerId);

    if (error) throw error;
    return data;
  },

  /**
   * Update registration status
   */
  async updateRegistrationStatus(id: string, status: RegistrationStatus) {
    const { data, error } = await supabase
      .from('registrations')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Mark registration as paid
   */
  async markAsPaid(id: string, amount: number, stripeSessionId: string) {
    const { data, error } = await supabase
      .from('registrations')
      .update({
        status: 'paid',
        amount,
        stripe_session_id: stripeSessionId,
        paid_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete registration
   */
  async deleteRegistration(id: string) {
    const { error } = await supabase.from('registrations').delete().eq('id', id);
    if (error) throw error;
  },
};
