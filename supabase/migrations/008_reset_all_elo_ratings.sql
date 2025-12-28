-- 008: ELO 레이팅 전체 초기화
-- 모든 멤버를 동일한 출발선(1200점)에서 시작하도록 초기화

-- ⚠️ 주의: 이 마이그레이션은 모든 ELO 데이터를 삭제합니다!
-- 실행 전에 반드시 백업을 권장합니다.

-- 1. 모든 ELO 히스토리 삭제
TRUNCATE TABLE member_ratings;

-- 2. 모든 멤버의 ELO 관련 컬럼 초기화
UPDATE members
SET
  current_elo = 1200,
  peak_elo = 1200,
  total_games = 0,
  total_wins = 0,
  current_streak = 0;

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ ELO 레이팅이 모두 초기화되었습니다.';
  RAISE NOTICE '   - 모든 멤버 ELO: 1200점';
  RAISE NOTICE '   - member_ratings 기록: 삭제됨';
  RAISE NOTICE '   - 이제 게임별로 ELO를 다시 계산하세요.';
END $$;
