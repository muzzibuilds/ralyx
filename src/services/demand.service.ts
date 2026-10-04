/**
 * Demand Lead Service
 * Database operations for demand queue / interested players
 */

import { supabase } from '../lib/supabase';
import type { DemandLead } from '../types';

export const demandService = {
  /**
   * Create a new demand lead entry
   */
  async createDemandLead(lead: Omit<DemandLead, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('demand_leads')
      .insert([
        {
          first_name: lead.firstName,
          last_name: lead.lastName,
          email: lead.email,
          phone: lead.phone,
          dupr_rating: lead.duprRating,
          dupr_profile_url: lead.duprProfileUrl,
          preferred_day: lead.preferredDay,
          reason: lead.reason,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all demand leads
   */
  async getDemandLeads(limit?: number, offset?: number) {
    let query = supabase
      .from('demand_leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (limit) query = query.limit(limit);
    if (offset) query = query.range(offset, offset + (limit || 10) - 1);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Get demand leads count
   */
  async getDemandLeadsCount() {
    const { count, error } = await supabase
      .from('demand_leads')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  },

  /**
   * Get demand leads by preferred day
   */
  async getDemandLeadsByPreferredDay(day: 'Saturday' | 'Sunday' | 'Either') {
    const { data, error } = await supabase
      .from('demand_leads')
      .select('*')
      .or(`preferred_day.eq.${day},preferred_day.eq.Either`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Delete demand lead
   */
  async deleteDemandLead(id: string) {
    const { error } = await supabase.from('demand_leads').delete().eq('id', id);
    if (error) throw error;
  },

  /**
   * Check if email already in demand queue
   */
  async checkEmailExists(email: string) {
    const { data, error } = await supabase
      .from('demand_leads')
      .select('id')
      .eq('email', email)
      .single();

    if (error && error.code === 'PGRST116') return false; // No rows
    if (error) throw error;
    return !!data;
  },
};
