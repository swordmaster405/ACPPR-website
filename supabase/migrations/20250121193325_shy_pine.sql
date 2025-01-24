/*
  # Initial Schema Setup for ACPPR

  1. New Tables
    - `profiles`
      - Stores user profile information for both contractors and end users
      - Links to Supabase auth.users
    - `contractor_profiles`
      - Additional information specific to contractors
      - One-to-one relationship with profiles for contractors
    - `jobs`
      - Job postings created by end users
    - `bids`
      - Contractor bids on jobs
    - `appointments`
      - Scheduled appointments between users and contractors
    - `reviews`
      - User reviews for contractors
    - `services`
      - List of services offered by contractors
    - `contractor_services`
      - Junction table linking contractors to their offered services

  2. Security
    - Enable RLS on all tables
    - Add policies for appropriate access control
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  full_name text,
  avatar_url text,
  user_type text NOT NULL CHECK (user_type IN ('contractor', 'user')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contractor_profiles table
CREATE TABLE contractor_profiles (
  id uuid PRIMARY KEY REFERENCES profiles(id),
  business_name text,
  description text,
  license_number text,
  years_experience integer DEFAULT 0,
  service_area text[],
  website text,
  phone text,
  insurance_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create services table
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create contractor_services junction table
CREATE TABLE contractor_services (
  contractor_id uuid REFERENCES contractor_profiles(id),
  service_id uuid REFERENCES services(id),
  rate_type text CHECK (rate_type IN ('hourly', 'fixed', 'estimate')),
  rate decimal,
  PRIMARY KEY (contractor_id, service_id)
);

-- Create jobs table
CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  title text NOT NULL,
  description text NOT NULL,
  service_id uuid REFERENCES services(id),
  budget_range_min decimal,
  budget_range_max decimal,
  location text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bids table
CREATE TABLE bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id),
  contractor_id uuid REFERENCES contractor_profiles(id),
  amount decimal NOT NULL,
  proposal text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  contractor_id uuid REFERENCES contractor_profiles(id),
  date timestamptz NOT NULL,
  duration interval,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  contractor_id uuid REFERENCES contractor_profiles(id),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Contractor profiles policies
CREATE POLICY "Contractor profiles are viewable by everyone"
  ON contractor_profiles FOR SELECT
  USING (true);

CREATE POLICY "Contractors can insert their own profile"
  ON contractor_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Contractors can update own profile"
  ON contractor_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Services policies
CREATE POLICY "Services are viewable by everyone"
  ON services FOR SELECT
  USING (true);

-- Contractor services policies
CREATE POLICY "Contractor services are viewable by everyone"
  ON contractor_services FOR SELECT
  USING (true);

CREATE POLICY "Contractors can manage their own services"
  ON contractor_services FOR ALL
  USING (auth.uid() = contractor_id);

-- Jobs policies
CREATE POLICY "Jobs are viewable by everyone"
  ON jobs FOR SELECT
  USING (true);

CREATE POLICY "Users can create jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Job owners can update their jobs"
  ON jobs FOR UPDATE
  USING (auth.uid() = user_id);

-- Bids policies
CREATE POLICY "Bids are viewable by job owner and bidding contractor"
  ON bids FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM jobs WHERE jobs.id = job_id
      UNION
      SELECT contractor_id
    )
  );

CREATE POLICY "Contractors can create bids"
  ON bids FOR INSERT
  WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY "Contractors can update their own bids"
  ON bids FOR UPDATE
  USING (auth.uid() = contractor_id);

-- Appointments policies
CREATE POLICY "Appointments are viewable by involved parties"
  ON appointments FOR SELECT
  USING (auth.uid() IN (user_id, contractor_id));

CREATE POLICY "Users and contractors can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() IN (user_id, contractor_id));

CREATE POLICY "Involved parties can update appointments"
  ON appointments FOR UPDATE
  USING (auth.uid() IN (user_id, contractor_id));

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);