-- GameResults 테이블 생성 (경기 결과 및 통계)
CREATE TABLE game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- 기본 정보
  team TEXT NOT NULL CHECK (team IN ('blue', 'red')),
  position TEXT NOT NULL CHECK (position IN ('top', 'jungle', 'mid', 'adc', 'support')),
  champion_name TEXT NOT NULL,

  -- KDA 통계
  kills INTEGER NOT NULL DEFAULT 0,
  deaths INTEGER NOT NULL DEFAULT 0,
  assists INTEGER NOT NULL DEFAULT 0,
  max_kill_streak INTEGER DEFAULT 0,
  max_multikill INTEGER DEFAULT 0,

  -- 특수 이벤트
  first_blood BOOLEAN DEFAULT FALSE,

  -- CS 통계
  cs INTEGER NOT NULL DEFAULT 0,
  neutral_monsters_killed INTEGER DEFAULT 0,

  -- 피해량 통계
  champion_damage INTEGER NOT NULL DEFAULT 0,
  turret_damage INTEGER DEFAULT 0,
  objective_damage INTEGER DEFAULT 0,
  damage_taken INTEGER NOT NULL DEFAULT 0,

  -- 힐 및 방어 통계
  healing INTEGER DEFAULT 0,
  damage_reduction INTEGER DEFAULT 0,

  -- CC 통계
  cc_score INTEGER DEFAULT 0,

  -- 골드 통계
  gold_earned INTEGER NOT NULL DEFAULT 0,
  gold_spent INTEGER DEFAULT 0,

  -- 시야 통계
  vision_score INTEGER NOT NULL DEFAULT 0,
  wards_placed INTEGER NOT NULL DEFAULT 0,
  wards_destroyed INTEGER NOT NULL DEFAULT 0,
  control_wards_purchased INTEGER DEFAULT 0,

  -- 오브젝트 통계
  turret_kills INTEGER DEFAULT 0,
  inhibitor_kills INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 한 경기에 같은 멤버가 중복 참가 불가
  UNIQUE(match_id, member_id)
);

-- 인덱스 생성
CREATE INDEX idx_game_results_match_id ON game_results(match_id);
CREATE INDEX idx_game_results_member_id ON game_results(member_id);
CREATE INDEX idx_game_results_champion ON game_results(champion_name);
CREATE INDEX idx_game_results_position ON game_results(position);
CREATE INDEX idx_game_results_team ON game_results(team);

-- RLS 활성화
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;

-- 읽기 전용 정책 (모든 사용자)
CREATE POLICY "Enable read access for all users" ON game_results FOR SELECT USING (true);

-- updated_at 트리거
CREATE TRIGGER update_game_results_updated_at
BEFORE UPDATE ON game_results
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
