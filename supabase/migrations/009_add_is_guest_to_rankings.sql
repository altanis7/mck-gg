-- 009: member_rankings 뷰에 is_guest 필드 추가
-- 용병(is_guest) 필터링을 위해 is_guest 컬럼을 뷰에 포함

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
  m.current_streak,
  m.is_guest,
  RANK() OVER (ORDER BY m.current_elo DESC, m.peak_elo DESC, m.name ASC) AS ranking,
  -- 승률 계산
  CASE WHEN m.total_games > 0
    THEN ROUND((m.total_wins::NUMERIC / m.total_games::NUMERIC) * 100, 1)
    ELSE 0
  END AS win_rate
FROM members m
ORDER BY ranking;

COMMENT ON VIEW member_rankings IS '전체 멤버 랭킹 (is_guest 포함, 필터링 가능)';
