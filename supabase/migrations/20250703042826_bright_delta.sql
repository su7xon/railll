-- Create complaint_files table to store files uploaded with complaints
CREATE TABLE IF NOT EXISTS complaint_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid REFERENCES complaints(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  file_url text,
  upload_status text NOT NULL DEFAULT 'pending' CHECK (upload_status IN ('pending', 'uploading', 'completed', 'failed')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE complaint_files ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes)
CREATE POLICY "Allow public read access to complaint_files"
  ON complaint_files
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to complaint_files"
  ON complaint_files
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to complaint_files"
  ON complaint_files
  FOR UPDATE
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_complaint_files_complaint_id ON complaint_files(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_files_upload_status ON complaint_files(upload_status);
CREATE INDEX IF NOT EXISTS idx_complaint_files_created_at ON complaint_files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaint_files_file_type ON complaint_files(file_type);

-- Add trigger to update complaints when files are added
CREATE OR REPLACE FUNCTION update_complaint_file_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the complaint with file count information
  UPDATE complaints 
  SET updated_at = now()
  WHERE id = NEW.complaint_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_complaint_file_count_trigger
  AFTER INSERT ON complaint_files
  FOR EACH ROW
  EXECUTE FUNCTION update_complaint_file_count();

-- Insert sample complaint files data
INSERT INTO complaint_files (complaint_id, file_name, file_type, file_size, upload_status, metadata) 
SELECT 
  c.id,
  'evidence_photo_' || EXTRACT(epoch FROM now())::text || '.jpg',
  'image/jpeg',
  2048000,
  'completed',
  '{"description": "Evidence photo for complaint", "location": "Coach B4"}'
FROM complaints c 
WHERE c.type = 'theft' 
LIMIT 1;