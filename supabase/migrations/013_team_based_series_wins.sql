-- =====================================================
-- 마이그레이션 013: 팀 기반 시리즈 승리 추적
-- =====================================================
-- 설명:
-- 기존 blue_wins/red_wins 대신 team_a_wins/team_b_wins로 변경
-- 첫 게임 블루팀 멤버를 team_a로 정의하여 진영 교체 시에도 정확한 승리 추적
-- =====================================================

-- 1. match_series 테이블에 team_a_wins, team_b_wins 컬럼 추가
ALTER TABLE match_series
ADD COLUMN team_a_wins INTEGER DEFAULT 0,
ADD COLUMN team_b_wins INTEGER DEFAULT 0;

COMMENT ON COLUMN match_series.team_a_wins IS '팀 A 승리 횟수 (첫 게임 블루팀 기준)';
COMMENT ON COLUMN match_series.team_b_wins IS '팀 B 승리 횟수 (첫 게임 레드팀 기준)';

-- 2. winner_team CHECK 제약 조건 수정 (blue/red → team_a/team_b 추가)
-- 먼저 기존 제약 조건 삭제
ALTER TABLE match_series DROP CONSTRAINT IF EXISTS winner_team_when_completed;
ALTER TABLE match_series DROP CONSTRAINT IF EXISTS match_series_winner_team_check;

-- 새로운 CHECK 제약 조건 추가 (team_a/team_b 허용)
ALTER TABLE match_series
ADD CONSTRAINT match_series_winner_team_check
CHECK (winner_team IN ('blue', 'red', 'team_a', 'team_b'));

-- 완료 상태에서 winner_team 필수 제약 조건 다시 추가
ALTER TABLE match_series
ADD CONSTRAINT winner_team_when_completed CHECK (
  (series_status = 'completed' AND winner_team IS NOT NULL) OR
  (series_status IN ('scheduled', 'ongoing'))
);

-- 3. 기존 데이터 마이그레이션: blue_wins/red_wins → team_a_wins/team_b_wins
-- 기존 데이터에서는 blue=team_a, red=team_b로 간주
UPDATE match_series
SET
  team_a_wins = blue_wins,
  team_b_wins = red_wins,
  winner_team = CASE
    WHEN winner_team = 'blue' THEN 'team_a'
    WHEN winner_team = 'red' THEN 'team_b'
    ELSE winner_team
  END
WHERE winner_team IN ('blue', 'red');

-- 4. 멤버 시리즈 통계 트리거 수정
-- 기존 트리거 삭제
DROP TRIGGER IF EXISTS trigger_update_series_stats ON match_series;
DROP FUNCTION IF EXISTS update_member_series_stats();

-- 새로운 트리거 함수 생성 (팀 A/B 기반)
CREATE OR REPLACE FUNCTION update_member_series_stats()
RETURNS TRIGGER AS $$
DECLARE
  first_game_id UUID;
  team_a_members UUID[];
BEGIN
  -- 시리즈가 완료 상태로 변경된 경우
  IF NEW.series_status = 'completed' AND (OLD.series_status IS NULL OR OLD.series_status != 'completed') THEN
    
    -- 첫 번째 게임의 ID 가져오기
    SELECT id INTO first_game_id
    FROM games
    WHERE match_series_id = NEW.id
    ORDER BY game_number ASC
    LIMIT 1;
    
    -- 첫 게임에서 블루팀 멤버들 = team_a
    SELECT ARRAY_AGG(member_id) INTO team_a_members
    FROM game_results
    WHERE game_id = first_game_id AND team = 'blue';
    
    -- 참가한 모든 멤버의 통계 업데이트
    UPDATE members m
    SET
      total_series = m.total_series + 1,
      total_series_wins = m.total_series_wins + CASE
        -- 멤버가 team_a에 속하고 winner_team이 team_a면 승리
        WHEN (m.id = ANY(team_a_members) AND NEW.winner_team = 'team_a') THEN 1
        -- 멤버가 team_b에 속하고 winner_team이 team_b면 승리
        WHEN (NOT (m.id = ANY(team_a_members)) AND NEW.winner_team = 'team_b') THEN 1
        ELSE 0
      END
    WHERE m.id IN (
      SELECT DISTINCT gr.member_id
      FROM game_results gr
      INNER JOIN games g ON g.id = gr.game_id
      WHERE g.match_series_id = NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_member_series_stats() IS '시리즈 완료 시 멤버 시리즈 통계 자동 업데이트 (팀 A/B 기반)';

CREATE TRIGGER trigger_update_series_stats
AFTER UPDATE ON match_series
FOR EACH ROW
EXECUTE FUNCTION update_member_series_stats();

COMMENT ON TRIGGER trigger_update_series_stats ON match_series IS '시리즈 완료 시 멤버 통계 자동 업데이트 트리거 (팀 A/B 기반)';

-- 5. 기존 완료된 시리즈의 멤버 통계 재계산
-- 먼저 모든 멤버의 시리즈 통계 초기화
UPDATE members
SET total_series = 0, total_series_wins = 0;

-- 완료된 시리즈별로 통계 재계산
DO $$
DECLARE
  series_rec RECORD;
  first_game_id UUID;
  team_a_members UUID[];
BEGIN
  FOR series_rec IN 
    SELECT id, winner_team 
    FROM match_series 
    WHERE series_status = 'completed' AND winner_team IS NOT NULL
  LOOP
    -- 첫 번째 게임 ID 가져오기
    SELECT id INTO first_game_id
    FROM games
    WHERE match_series_id = series_rec.id
    ORDER BY game_number ASC
    LIMIT 1;
    
    IF first_game_id IS NULL THEN
      CONTINUE;
    END IF;
    
    -- 첫 게임 블루팀 멤버 = team_a
    SELECT ARRAY_AGG(member_id) INTO team_a_members
    FROM game_results
    WHERE game_id = first_game_id AND team = 'blue';
    
    -- 참가 멤버 통계 업데이트
    UPDATE members m
    SET
      total_series = m.total_series + 1,
      total_series_wins = m.total_series_wins + CASE
        WHEN (m.id = ANY(team_a_members) AND series_rec.winner_team = 'team_a') THEN 1
        WHEN (NOT (m.id = ANY(team_a_members)) AND series_rec.winner_team = 'team_b') THEN 1
        ELSE 0
      END
    WHERE m.id IN (
      SELECT DISTINCT gr.member_id
      FROM game_results gr
      INNER JOIN games g ON g.id = gr.game_id
      WHERE g.match_series_id = series_rec.id
    );
  END LOOP;
  
  RAISE NOTICE '시리즈 통계 재계산 완료';
END $$;

-- 6. 마이그레이션 검증
DO $$
DECLARE
  team_a_wins_exists BOOLEAN;
  team_b_wins_exists BOOLEAN;
  trigger_exists BOOLEAN;
BEGIN
  -- team_a_wins 컬럼 존재 확인
  SELECT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'match_series'
    AND column_name = 'team_a_wins'
  ) INTO team_a_wins_exists;

  -- team_b_wins 컬럼 존재 확인
  SELECT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'match_series'
    AND column_name = 'team_b_wins'
  ) INTO team_b_wins_exists;

  -- 트리거 존재 확인
  SELECT EXISTS (
    SELECT FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    AND trigger_name = 'trigger_update_series_stats'
  ) INTO trigger_exists;

  RAISE NOTICE '마이그레이션 013 검증:';
  RAISE NOTICE 'match_series.team_a_wins 컬럼: %',
    CASE WHEN team_a_wins_exists THEN '✓' ELSE '✗' END;
  RAISE NOTICE 'match_series.team_b_wins 컬럼: %',
    CASE WHEN team_b_wins_exists THEN '✓' ELSE '✗' END;
  RAISE NOTICE 'trigger_update_series_stats 트리거: %',
    CASE WHEN trigger_exists THEN '✓' ELSE '✗' END;

  IF team_a_wins_exists AND team_b_wins_exists AND trigger_exists THEN
    RAISE NOTICE '✓ 마이그레이션 013 성공';
  ELSE
    RAISE EXCEPTION '✗ 마이그레이션 013 실패: 일부 객체가 생성되지 않음';
  END IF;
END $$;

