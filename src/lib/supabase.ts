import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  user_type: 'contractor' | 'user';
  created_at: string;
  updated_at: string;
};

export type ContractorProfile = {
  id: string;
  business_name: string | null;
  description: string | null;
  license_number: string | null;
  years_experience: number;
  service_area: string[];
  website: string | null;
  phone: string | null;
  insurance_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: string;
  name: string;
  category: string;
  created_at: string;
};

export type Job = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  service_id: string;
  budget_range_min: number | null;
  budget_range_max: number | null;
  location: string | null;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
};

export type Bid = {
  id: string;
  job_id: string;
  contractor_id: string;
  amount: number;
  proposal: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
};

export type Appointment = {
  id: string;
  user_id: string;
  contractor_id: string;
  date: string;
  duration: string | null;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  user_id: string;
  contractor_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};