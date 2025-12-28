-- =====================================================
-- 마이그레이션 006: ELO 랭킹 시스템 구축
-- =====================================================
-- 설명:
-- 멤버별 ELO 점수 추적 및 랭킹 시스템을 구축합니다.
-- - member_ratings: ELO 히스토리 테이블
-- - members 테이블 확장: current_elo, peak_elo 등
-- - member_rankings 뷰: 실시간 랭킹 조회
-- =====================================================

-- 1. member_ratings 테이블 생성 (ELO 히스토리)
CREATE TABLE member_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 관계
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,

  -- ELO 점수
  elo_rating INTEGER NOT NULL CHECK (elo_rating >= 1000 AND elo_rating <= 2000),
  previous_rating INTEGER NOT NULL CHECK (previous_rating >= 1000 AND previous_rating <= 2000),
  rating_change INTEGER NOT NULL, -- +25, -18 등

  -- 순위 변동
  ranking_before INTEGER NOT NULL,
  ranking_after INTEGER NOT NULL,

  -- 게임 정보 (denormalization for performance)
  team TEXT NOT NULL CHECK (team IN ('blue', 'red')),
  won BOOLEAN NOT NULL,

  -- 연승/연패 추적
  streak_before INTEGER NOT NULL DEFAULT 0, -- 양수: 연승, 음수: 연패
  streak_after INTEGER NOT NULL DEFAULT 0,
  streak_bonus INTEGER DEFAULT 0, -- 연승/연패 보너스 점수

  -- 메타정보
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 복합 제약: 한 게임당 한 멤버는 하나의 레이팅 기록만
  UNIQUE(game_id, member_id)
);

-- 인덱스
CREATE INDEX idx_member_ratings_member_id ON member_ratings(member_id);
CREATE INDEX idx_member_ratings_game_id ON member_ratings(game_id);
CREATE INDEX idx_member_ratings_created_at ON member_ratings(created_at DESC);
CREATE INDEX idx_member_ratings_elo_rating ON member_ratings(elo_rating DESC);
CREATE INDEX idx_member_ratings_member_latest ON member_ratings(member_id, created_at DESC);

-- RLS
ALTER TABLE member_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON member_ratings FOR SELECT USING (true);

COMMENT ON TABLE member_ratings IS 'ELO 레이팅 히스토리 - 각 게임 후 멤버별 점수 변동 기록';
COMMENT ON COLUMN member_ratings.streak_before IS '게임 전 연승/연패 상태 (양수: 연승, 음수: 연패, 0: 첫 게임 또는 연속 끊김)';
COMMENT ON COLUMN member_ratings.streak_bonus IS '연승/연패 보너스로 인한 추가 점수 (양수/음수 모두 가능)';


-- 2. members 테이블 확장 (ELO 관련 컬럼 추가)
ALTER TABLE members
ADD COLUMN current_elo INTEGER DEFAULT 1200 CHECK (current_elo >= 1000 AND current_elo <= 2000),
ADD COLUMN peak_elo INTEGER DEFAULT 1200 CHECK (peak_elo >= 1000 AND peak_elo <= 2000),
ADD COLUMN total_games INTEGER DEFAULT 0,
ADD COLUMN total_wins INTEGER DEFAULT 0,
ADD COLUMN current_streak INTEGER DEFAULT 0; -- 양수: 연승, 음수: 연패

-- 인덱스
CREATE INDEX idx_members_current_elo ON members(current_elo DESC);

COMMENT ON COLUMN members.current_elo IS '현재 ELO 점수 (denormalized for performance)';
COMMENT ON COLUMN members.peak_elo IS '역대 최고 ELO 점수';
COMMENT ON COLUMN members.current_streak IS '현재 연승/연패 상태 (양수: 연승, 음수: 연패)';


-- 3. member_rankings 뷰 생성 (실시간 랭킹 조회)
-- 주의: 티어는 순위 백분율 기반으로 클라이언트에서 계산
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
WHERE m.total_games > 0 -- 게임을 한 번 이상 플레이한 멤버만
ORDER BY ranking;

COMMENT ON VIEW member_rankings IS 'ELO 기반 멤버 랭킹 (실시간 순위 포함, 티어는 클라이언트에서 백분율 기반 계산)';


-- 4. 초기 ELO 설정 (기존 멤버들에게 솔로랭크 기반 초기 ELO 부여)
UPDATE members
SET current_elo = CASE
  WHEN solo_tier IS NULL THEN 1200
  WHEN UPPER(solo_tier) = 'IRON' THEN 1000
  WHEN UPPER(solo_tier) = 'BRONZE' THEN 1100
  WHEN UPPER(solo_tier) = 'SILVER' THEN 1200
  WHEN UPPER(solo_tier) = 'GOLD' THEN 1300
  WHEN UPPER(solo_tier) = 'PLATINUM' THEN 1400
  WHEN UPPER(solo_tier) = 'EMERALD' THEN 1450
  WHEN UPPER(solo_tier) = 'DIAMOND' THEN 1500
  WHEN UPPER(solo_tier) = 'MASTER' THEN 1600
  WHEN UPPER(solo_tier) = 'GRANDMASTER' THEN 1700
  WHEN UPPER(solo_tier) = 'CHALLENGER' THEN 1800
  ELSE 1200
END,
peak_elo = CASE
  WHEN solo_tier IS NULL THEN 1200
  WHEN UPPER(solo_tier) = 'IRON' THEN 1000
  WHEN UPPER(solo_tier) = 'BRONZE' THEN 1100
  WHEN UPPER(solo_tier) = 'SILVER' THEN 1200
  WHEN UPPER(solo_tier) = 'GOLD' THEN 1300
  WHEN UPPER(solo_tier) = 'PLATINUM' THEN 1400
  WHEN UPPER(solo_tier) = 'EMERALD' THEN 1450
  WHEN UPPER(solo_tier) = 'DIAMOND' THEN 1500
  WHEN UPPER(solo_tier) = 'MASTER' THEN 1600
  WHEN UPPER(solo_tier) = 'GRANDMASTER' THEN 1700
  WHEN UPPER(solo_tier) = 'CHALLENGER' THEN 1800
  ELSE 1200
END
WHERE current_elo IS NULL OR current_elo = 1200;


-- 5. 마이그레이션 검증
DO $$
DECLARE
  ratings_table_exists BOOLEAN;
  members_elo_column_exists BOOLEAN;
  view_exists BOOLEAN;
BEGIN
  -- member_ratings 테이블 존재 확인
  SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'member_ratings'
  ) INTO ratings_table_exists;

  -- members.current_elo 컬럼 존재 확인
  SELECT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'members'
    AND column_name = 'current_elo'
  ) INTO members_elo_column_exists;

  -- member_rankings 뷰 존재 확인
  SELECT EXISTS (
    SELECT FROM information_schema.views
    WHERE table_schema = 'public'
    AND table_name = 'member_rankings'
  ) INTO view_exists;

  RAISE NOTICE '마이그레이션 006 검증:';
  RAISE NOTICE 'member_ratings 테이블: %',
    CASE WHEN ratings_table_exists THEN '✓' ELSE '✗' END;
  RAISE NOTICE 'members.current_elo 컬럼: %',
    CASE WHEN members_elo_column_exists THEN '✓' ELSE '✗' END;
  RAISE NOTICE 'member_rankings 뷰: %',
    CASE WHEN view_exists THEN '✓' ELSE '✗' END;

  IF ratings_table_exists AND members_elo_column_exists AND view_exists THEN
    RAISE NOTICE '✓ 마이그레이션 006 성공';
  ELSE
    RAISE EXCEPTION '✗ 마이그레이션 006 실패: 일부 객체가 생성되지 않음';
  END IF;
END $$;
