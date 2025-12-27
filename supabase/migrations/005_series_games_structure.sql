-- =====================================================
-- 마이그레이션 005: 시리즈/게임 구조 도입
-- =====================================================
-- 설명:
-- 기존 matches 테이블을 match_series로 확장하고,
-- 시리즈 내 여러 게임을 지원하며, 게임별 밴픽 정보를 저장합니다.
-- =====================================================

-- 1. match_series 테이블 생성 (기존 matches 대체)
CREATE TABLE match_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 기본 정보
  series_date TIMESTAMPTZ NOT NULL,
  series_type TEXT NOT NULL CHECK (series_type IN ('bo1', 'bo3', 'bo5')),
  series_status TEXT NOT NULL CHECK (series_status IN ('scheduled', 'ongoing', 'completed')),

  -- 결과
  winner_team TEXT CHECK (winner_team IN ('blue', 'red')),
  blue_wins INTEGER DEFAULT 0,
  red_wins INTEGER DEFAULT 0,

  -- 메타정보
  screenshot_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 게임 완료 후에만 winner_team이 NULL이 아님
  CONSTRAINT winner_team_when_completed CHECK (
    (series_status = 'completed' AND winner_team IS NOT NULL) OR
    (series_status IN ('scheduled', 'ongoing'))
  )
);

CREATE INDEX idx_match_series_date ON match_series(series_date DESC);
CREATE INDEX idx_match_series_status ON match_series(series_status);
CREATE INDEX idx_match_series_winner ON match_series(winner_team);

ALTER TABLE match_series ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON match_series FOR SELECT USING (true);

CREATE TRIGGER update_match_series_updated_at
BEFORE UPDATE ON match_series
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- 2. games 테이블 생성 (시리즈 내 개별 게임)
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_series_id UUID NOT NULL REFERENCES match_series(id) ON DELETE CASCADE,

  -- 게임 순서 및 상태
  game_number INTEGER NOT NULL,
  game_status TEXT NOT NULL CHECK (game_status IN ('not_started', 'in_progress', 'completed')),

  -- 게임 결과
  winning_team TEXT CHECK (winning_team IN ('blue', 'red')),
  duration INTEGER, -- 초 단위

  -- 메타정보
  screenshot_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 복합 제약: 시리즈 내 게임 번호는 고유
  UNIQUE(match_series_id, game_number),

  -- 완료된 게임만 승리팀 정보 필요
  CONSTRAINT winning_team_when_completed CHECK (
    (game_status = 'completed' AND winning_team IS NOT NULL) OR
    (game_status IN ('not_started', 'in_progress'))
  )
);

CREATE INDEX idx_games_match_series_id ON games(match_series_id);
CREATE INDEX idx_games_game_number ON games(match_series_id, game_number);
CREATE INDEX idx_games_status ON games(game_status);
CREATE INDEX idx_games_winning_team ON games(winning_team);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON games FOR SELECT USING (true);

CREATE TRIGGER update_games_updated_at
BEFORE UPDATE ON games
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- 3. ban_picks 테이블 생성 (게임별 밴픽 정보)
CREATE TABLE ban_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,

  -- 팀 및 순서
  team TEXT NOT NULL CHECK (team IN ('blue', 'red')),
  phase TEXT NOT NULL CHECK (phase IN ('ban', 'pick')),
  order_number INTEGER NOT NULL, -- 1-10 (밴 5개 + 픽 5개)

  -- 챔피언 정보
  champion_name TEXT NOT NULL,

  -- 선택한 포지션 (pick인 경우만)
  position TEXT CHECK (position IN ('top', 'jungle', 'mid', 'adc', 'support')),
  selected_by_member_id UUID REFERENCES members(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 밴: 포지션 미지정, 멤버 미지정
  -- 픽: 포지션 지정, 멤버 지정
  CONSTRAINT pick_requires_position_and_member CHECK (
    (phase = 'pick' AND position IS NOT NULL AND selected_by_member_id IS NOT NULL) OR
    (phase = 'ban')
  )
);

CREATE INDEX idx_ban_picks_game_id ON ban_picks(game_id);
CREATE INDEX idx_ban_picks_team ON ban_picks(team);
CREATE INDEX idx_ban_picks_phase ON ban_picks(phase);
CREATE INDEX idx_ban_picks_champion ON ban_picks(champion_name);
CREATE UNIQUE INDEX idx_ban_picks_game_order ON ban_picks(game_id, order_number);

ALTER TABLE ban_picks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON ban_picks FOR SELECT USING (true);

CREATE TRIGGER update_ban_picks_updated_at
BEFORE UPDATE ON ban_picks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- 4. game_results 테이블 수정 (match_id -> game_id)
-- 기존 외래키 제약 삭제
ALTER TABLE game_results
DROP CONSTRAINT game_results_match_id_fkey;

-- 컬럼명 변경
ALTER TABLE game_results
RENAME COLUMN match_id TO game_id;

-- 새 외래키 제약 추가 (임시로 games 테이블 참조 비활성화, 데이터 마이그레이션 후 활성화)
-- ALTER TABLE game_results
-- ADD CONSTRAINT game_results_game_id_fkey
-- FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE;

-- 복합 UNIQUE 제약 업데이트
ALTER TABLE game_results
DROP CONSTRAINT game_results_match_id_member_id_key;

ALTER TABLE game_results
ADD UNIQUE(game_id, member_id);

-- 인덱스 업데이트
DROP INDEX IF EXISTS idx_game_results_match_id;
CREATE INDEX idx_game_results_game_id ON game_results(game_id);


-- 5. 기존 matches 테이블 백업
ALTER TABLE matches RENAME TO old_matches;


-- 6. 데이터 마이그레이션 (old_matches -> match_series + games)
-- 매핑 테이블 생성
CREATE TEMPORARY TABLE migration_map (
  old_match_id UUID,
  new_series_id UUID,
  new_game_id UUID
);

-- old_matches -> match_series 마이그레이션
WITH inserted_series AS (
  INSERT INTO match_series (series_date, series_type, series_status, winner_team, blue_wins, red_wins, screenshot_url, notes, created_at, updated_at)
  SELECT
    om.match_date,
    'bo1'::text,
    'completed'::text,
    om.winning_team,
    CASE WHEN om.winning_team = 'blue' THEN 1 ELSE 0 END,
    CASE WHEN om.winning_team = 'red' THEN 1 ELSE 0 END,
    om.screenshot_url,
    om.notes,
    om.created_at,
    om.updated_at
  FROM old_matches om
  RETURNING id, series_date, screenshot_url, winner_team, created_at
)
INSERT INTO migration_map (old_match_id, new_series_id)
SELECT om.id, ins.id
FROM old_matches om
JOIN inserted_series ins ON
  om.match_date = ins.series_date AND
  COALESCE(om.screenshot_url, '') = COALESCE(ins.screenshot_url, '') AND
  om.winning_team = ins.winner_team AND
  om.created_at = ins.created_at;

-- match_series -> games 마이그레이션
WITH inserted_games AS (
  INSERT INTO games (match_series_id, game_number, game_status, winning_team, duration, screenshot_url, notes, created_at, updated_at)
  SELECT
    mm.new_series_id,
    1,
    'completed'::text,
    om.winning_team,
    om.duration,
    om.screenshot_url,
    om.notes,
    om.created_at,
    om.updated_at
  FROM migration_map mm
  JOIN old_matches om ON mm.old_match_id = om.id
  RETURNING id, match_series_id, created_at
)
UPDATE migration_map mm
SET new_game_id = ig.id
FROM inserted_games ig
JOIN match_series ms ON ig.match_series_id = ms.id
WHERE mm.new_series_id = ms.id;

-- game_results 업데이트
UPDATE game_results gr
SET game_id = mm.new_game_id
FROM migration_map mm
WHERE gr.game_id = mm.old_match_id;

-- 이제 외래키 제약 활성화
ALTER TABLE game_results
ADD CONSTRAINT game_results_game_id_fkey
FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE;

-- 7. 마이그레이션 검증
DO $$
DECLARE
  old_matches_count INTEGER;
  new_series_count INTEGER;
  new_games_count INTEGER;
  game_results_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO old_matches_count FROM old_matches;
  SELECT COUNT(*) INTO new_series_count FROM match_series;
  SELECT COUNT(*) INTO new_games_count FROM games;
  SELECT COUNT(DISTINCT game_id) INTO game_results_count FROM game_results;

  RAISE NOTICE '마이그레이션 검증:';
  RAISE NOTICE '기존 matches: %', old_matches_count;
  RAISE NOTICE '새 match_series: %', new_series_count;
  RAISE NOTICE '새 games: %', new_games_count;
  RAISE NOTICE 'game_results 업데이트: %', game_results_count;

  IF old_matches_count = new_series_count AND old_matches_count = new_games_count THEN
    RAISE NOTICE '✓ 마이그레이션 성공';
  ELSE
    RAISE EXCEPTION '✗ 마이그레이션 실패: 데이터 불일치';
  END IF;
END $$;

-- 8. 매핑 테이블 정리
DROP TABLE migration_map;

-- 9. 역호환성을 위한 뷰 생성 (선택적, 나중에 제거 예정)
CREATE VIEW matches AS
SELECT
  g.id,
  ms.series_date as match_date,
  g.duration,
  g.winning_team,
  g.screenshot_url,
  g.notes,
  g.created_at,
  g.updated_at
FROM games g
JOIN match_series ms ON g.match_series_id = ms.id;

COMMENT ON VIEW matches IS '역호환성을 위한 뷰. match_series가 bo1인 경우의 게임 목록을 표시합니다.';
