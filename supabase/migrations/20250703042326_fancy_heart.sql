/*
  # Emergency Files Storage Schema

  1. New Tables
    - `emergency_files`
      - `id` (uuid, primary key)
      - `alert_id` (uuid, foreign key to safety_alerts)
      - `file_name` (text)
      - `file_type` (text)
      - `file_size` (bigint)
      - `file_url` (text, nullable for future storage integration)
      - `upload_status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on emergency_files table
    - Add policies for public access (for demo purposes)

  3. Indexes
    - Add indexes for better performance
*/

-- Create emergency_files table
CREATE TABLE IF NOT EXISTS emergency_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid REFERENCES safety_alerts(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  file_url text,
  upload_status text NOT NULL DEFAULT 'pending' CHECK (upload_status IN ('pending', 'uploading', 'completed', 'failed')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE emergency_files ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes)
CREATE POLICY "Allow public read access to emergency_files"
  ON emergency_files
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to emergency_files"
  ON emergency_files
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to emergency_files"
  ON emergency_files
  FOR UPDATE
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_emergency_files_alert_id ON emergency_files(alert_id);
CREATE INDEX IF NOT EXISTS idx_emergency_files_upload_status ON emergency_files(upload_status);
CREATE INDEX IF NOT EXISTS idx_emergency_files_created_at ON emergency_files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emergency_files_file_type ON emergency_files(file_type);

-- Insert sample emergency files data
INSERT INTO emergency_files (alert_id, file_name, file_type, file_size, upload_status, metadata) 
SELECT 
  sa.id,
  'emergency_photo_' || EXTRACT(epoch FROM now())::text || '.jpg',
  'image/jpeg',
  1024000,
  'completed',
  '{"description": "Emergency evidence photo", "location": "Coach B4"}'
FROM safety_alerts sa 
WHERE sa.type = 'panic' 
LIMIT 1;

-- Add trigger to update safety_alerts when files are added
CREATE OR REPLACE FUNCTION update_alert_file_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the safety_alert with file count information
  UPDATE safety_alerts 
  SET coordinates = COALESCE(coordinates, '{}'::jsonb) || jsonb_build_object('file_count', (
    SELECT COUNT(*) FROM emergency_files WHERE alert_id = NEW.alert_id
  ))
  WHERE id = NEW.alert_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_alert_file_count_trigger
  AFTER INSERT ON emergency_files
  FOR EACH ROW
  EXECUTE FUNCTION update_alert_file_count();