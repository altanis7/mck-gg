-- 007: member_rankings 뷰 업데이트 (전체 멤버 표시)
-- 기존 뷰를 DROP하고 재생성하여 게임 참여 여부와 관계없이 모든 멤버 표시

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
  RANK() OVER (ORDER BY m.current_elo DESC, m.peak_elo DESC, m.name ASC) AS ranking,
  -- 승률 계산
  CASE WHEN m.total_games > 0
    THEN ROUND((m.total_wins::NUMERIC / m.total_games::NUMERIC) * 100, 1)
    ELSE 0
  END AS win_rate
FROM members m
-- WHERE 조건 제거: 모든 멤버 표시 (게임 참여 여부 무관)
ORDER BY ranking;

COMMENT ON VIEW member_rankings IS '전체 멤버 랭킹 - 게임 참여 여부와 관계없이 모든 멤버 표시';
