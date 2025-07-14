/*
  # Complete TrustLend Database Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `phone` (text)
      - `aadhaar` (text)
      - `is_verified` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `credit_assessments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `electricity_bill` (numeric)
      - `gas_bill` (numeric)
      - `water_bill` (numeric)
      - `monthly_data_recharge` (numeric)
      - `yearly_data_recharge` (numeric)
      - `payment_delay` (integer)
      - `area_type` (text)
      - `location_stability` (text)
      - `credit_score` (integer)
      - `risk_level` (text)
      - `confidence_percentage` (integer)
      - `assessed_at` (timestamp)

    - `loans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `bank_name` (text)
      - `amount` (numeric)
      - `issue_date` (date)
      - `due_date` (date)
      - `status` (text)
      - `loan_purpose` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data

  3. Functions
    - Auto-create user profiles on registration
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.loans CASCADE;
DROP TABLE IF EXISTS public.credit_assessments CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Create user_profiles table
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  aadhaar text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create credit_assessments table
CREATE TABLE public.credit_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  electricity_bill numeric DEFAULT 0,
  gas_bill numeric DEFAULT 0,
  water_bill numeric DEFAULT 0,
  monthly_data_recharge numeric DEFAULT 0,
  yearly_data_recharge numeric DEFAULT 0,
  payment_delay integer DEFAULT 0,
  area_type text DEFAULT 'Urban',
  location_stability text DEFAULT 'Stable',
  credit_score integer DEFAULT 0,
  risk_level text DEFAULT 'High Risk',
  confidence_percentage integer DEFAULT 0,
  assessed_at timestamptz DEFAULT now()
);

-- Create loans table
CREATE TABLE public.loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name text NOT NULL,
  amount numeric NOT NULL,
  issue_date date NOT NULL,
  due_date date NOT NULL,
  status text DEFAULT 'Active',
  loan_purpose text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for credit_assessments
CREATE POLICY "Users can view own assessments"
  ON public.credit_assessments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
  ON public.credit_assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for loans
CREATE POLICY "Users can view own loans"
  ON public.loans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own loans"
  ON public.loans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, name, phone, aadhaar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'aadhaar', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();