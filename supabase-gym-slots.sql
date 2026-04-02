-- Create gym_slots table for Gym Squad feature
CREATE TABLE IF NOT EXISTS gym_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_key TEXT NOT NULL,       -- e.g. "2026-04-02_08:00"
  member TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Unique constraint to prevent duplicate bookings
ALTER TABLE gym_slots
  ADD CONSTRAINT gym_slots_slot_key_member_unique UNIQUE (slot_key, member);

-- Disable RLS (public access like the original app)
ALTER TABLE gym_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to gym_slots"
  ON gym_slots
  FOR ALL
  USING (true)
  WITH CHECK (true);
