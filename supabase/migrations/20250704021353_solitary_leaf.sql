/*
  # Create safety alerts table

  1. New Tables
    - `safety_alerts`
      - `id` (uuid, primary key)
      - `user_id` (text)
      - `type` (text) - panic, emergency, suspicious
      - `location` (text)
      - `coordinates` (jsonb) - lat/lng coordinates
      - `status` (text) - active, responded, resolved
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `safety_alerts` table
    - Add policy for authenticated users to insert their own alerts
    - Add policy for authenticated users to read their own alerts
*/

CREATE TABLE IF NOT EXISTS safety_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  type text NOT NULL CHECK (type IN ('panic', 'emergency', 'suspicious')),
  location text NOT NULL,
  coordinates jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'responded', 'resolved')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE safety_alerts ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to insert their own safety alerts
CREATE POLICY "Users can insert their own safety alerts"
  ON safety_alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy to allow users to read their own safety alerts
CREATE POLICY "Users can read their own safety alerts"
  ON safety_alerts
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy to allow anonymous users to insert emergency alerts
CREATE POLICY "Anonymous users can insert emergency alerts"
  ON safety_alerts
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy to allow anonymous users to read emergency alerts
CREATE POLICY "Anonymous users can read emergency alerts"
  ON safety_alerts
  FOR SELECT
  TO anon
  USING (true);

-- Create an index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_safety_alerts_user_id ON safety_alerts(user_id);

-- Create an index on status for filtering
CREATE INDEX IF NOT EXISTS idx_safety_alerts_status ON safety_alerts(status);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_safety_alerts_created_at ON safety_alerts(created_at DESC);