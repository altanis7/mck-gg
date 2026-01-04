-- =====================================================
-- 마이그레이션 012: 시리즈 기반 승률 계산
-- =====================================================
-- 설명:
-- members 테이블에 시리즈 통계 컬럼 추가
-- - total_series: 전체 시리즈 참가 횟수
-- - total_series_wins: 시리즈 승리 횟수
-- member_rankings 뷰 업데이트: 승률을 시리즈 기반으로 계산
-- =====================================================

-- 1. members 테이블에 시리즈 통계 컬럼 추가
ALTER TABLE members
ADD COLUMN total_series INTEGER DEFAULT 0,
ADD COLUMN total_series_wins INTEGER DEFAULT 0;

COMMENT ON COLUMN members.total_series IS '전체 시리즈 참가 횟수';
COMMENT ON COLUMN members.total_series_wins IS '시리즈 승리 횟수';


-- 2. 기존 데이터 마이그레이션: 완료된 시리즈 기반으로 초기값 설정
UPDATE members m
SET
  total_series = (
    SELECT COUNT(DISTINCT ms.id)
    FROM match_series ms
    INNER JOIN games g ON g.match_series_id = ms.id
    INNER JOIN game_results gr ON gr.game_id = g.id
    WHERE gr.member_id = m.id
      AND ms.series_status = 'completed'
      AND ms.winner_team IS NOT NULL
  ),
  total_series_wins = (
    SELECT COUNT(DISTINCT ms.id)
    FROM match_series ms
    INNER JOIN games g ON g.match_series_id = ms.id
    INNER JOIN game_results gr ON gr.game_id = g.id
    WHERE gr.member_id = m.id
      AND ms.series_status = 'completed'
      AND ms.winner_team = gr.team
  );


-- 3. member_rankings 뷰 업데이트 (시리즈 승률로 변경)
DROP VIEW IF EXISTS member_rankings;

CREATE OR REPLACE VIEW member_rankings AS
SELECT
  m.id,
  m.name,
  m.summoner_name,
  m.solo_tier,
  m.solo_rank,
  m.current_elo,
  m.peak_elo,
  m.total_games,
  m.total_wins,
  m.total_series,           -- 신규
  m.total_series_wins,      -- 신규
  m.current_streak,
  m.current_series_streak,
  m.is_guest,
  RANK() OVER (ORDER BY m.current_elo DESC, m.peak_elo DESC, m.name ASC) AS ranking,
  -- 승률 계산 (시리즈 기반으로 변경)
  CASE WHEN m.total_series > 0
    THEN ROUND((m.total_series_wins::NUMERIC / m.total_series::NUMERIC) * 100, 1)
    ELSE 0
  END AS win_rate
FROM members m
ORDER BY ranking;

COMMENT ON VIEW member_rankings IS 'ELO 기반 멤버 랭킹 (승률은 시리즈 기준)';


-- 4. 시리즈 완료 시 멤버 통계 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_member_series_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- 시리즈가 완료 상태로 변경된 경우
  IF NEW.series_status = 'completed' AND (OLD.series_status IS NULL OR OLD.series_status != 'completed') THEN
    -- 참가한 모든 멤버의 통계 업데이트
    UPDATE members m
    SET
      total_series = m.total_series + 1,
      total_series_wins = m.total_series_wins + CASE
        WHEN gr.team = NEW.winner_team THEN 1
        ELSE 0
      END
    FROM (
      SELECT DISTINCT gr.member_id, gr.team
      FROM game_results gr
      INNER JOIN games g ON g.id = gr.game_id
      WHERE g.match_series_id = NEW.id
    ) gr
    WHERE gr.member_id = m.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_member_series_stats() IS '시리즈 완료 시 멤버 시리즈 통계 자동 업데이트';

CREATE TRIGGER trigger_update_series_stats
AFTER UPDATE ON match_series
FOR EACH ROW
EXECUTE FUNCTION update_member_series_stats();

COMMENT ON TRIGGER trigger_update_series_stats ON match_series IS '시리즈 완료 시 멤버 통계 자동 업데이트 트리거';


-- 5. 마이그레이션 검증
DO $$
DECLARE
  total_series_exists BOOLEAN;
  view_exists BOOLEAN;
  trigger_exists BOOLEAN;
BEGIN
  -- total_series 컬럼 존재 확인
  SELECT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'members'
    AND column_name = 'total_series'
  ) INTO total_series_exists;

  -- member_rankings 뷰 존재 확인
  SELECT EXISTS (
    SELECT FROM information_schema.views
    WHERE table_schema = 'public'
    AND table_name = 'member_rankings'
  ) INTO view_exists;

  -- 트리거 존재 확인
  SELECT EXISTS (
    SELECT FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    AND trigger_name = 'trigger_update_series_stats'
  ) INTO trigger_exists;

  RAISE NOTICE '마이그레이션 012 검증:';
  RAISE NOTICE 'members.total_series 컬럼: %',
    CASE WHEN total_series_exists THEN '✓' ELSE '✗' END;
  RAISE NOTICE 'member_rankings 뷰: %',
    CASE WHEN view_exists THEN '✓' ELSE '✗' END;
  RAISE NOTICE 'trigger_update_series_stats 트리거: %',
    CASE WHEN trigger_exists THEN '✓' ELSE '✗' END;

  IF total_series_exists AND view_exists AND trigger_exists THEN
    RAISE NOTICE '✓ 마이그레이션 012 성공';
  ELSE
    RAISE EXCEPTION '✗ 마이그레이션 012 실패: 일부 객체가 생성되지 않음';
  END IF;
END $$;
