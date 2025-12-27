-- Matches 테이블 생성
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_date TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL,
  winning_team TEXT NOT NULL CHECK (winning_team IN ('blue', 'red')),
  screenshot_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_matches_match_date ON matches(match_date DESC);
CREATE INDEX idx_matches_winning_team ON matches(winning_team);

-- RLS 활성화
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- 읽기 전용 정책 (모든 사용자)
CREATE POLICY "Enable read access for all users" ON matches FOR SELECT USING (true);

-- updated_at 트리거
CREATE TRIGGER update_matches_updated_at
BEFORE UPDATE ON matches
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
