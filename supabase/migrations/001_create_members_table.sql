-- Members 테이블 생성
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  summoner_name TEXT NOT NULL UNIQUE,
  riot_id TEXT NOT NULL,
  solo_tier TEXT,
  solo_rank TEXT,
  main_position TEXT NOT NULL,
  sub_position TEXT,
  is_guest BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_members_summoner_name ON members(summoner_name);
CREATE INDEX idx_members_is_guest ON members(is_guest);
CREATE INDEX idx_members_solo_tier ON members(solo_tier);

-- RLS 활성화
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- 읽기 전용 정책 (모든 사용자)
CREATE POLICY "Enable read access for all users" ON members FOR SELECT USING (true);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거
CREATE TRIGGER update_members_updated_at
BEFORE UPDATE ON members
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
