-- 010: 시리즈 기준 연승/연패 시스템 추가
-- match_series (BO3/BO5) 완료 기준으로 연승/연패 추적

-- 1. members 테이블에 시리즈 연승/연패 컬럼 추가
ALTER TABLE members
ADD COLUMN current_series_streak INTEGER DEFAULT 0;

-- 인덱스 생성 (랭킹 조회 최적화)
CREATE INDEX idx_members_current_series_streak
  ON members(current_series_streak DESC);

-- 컬럼 설명
COMMENT ON COLUMN members.current_series_streak IS
  '시리즈 기준 연승/연패 (양수: 연승, 음수: 연패, 0: 없음)';

-- 2. 시리즈 참가 이력 테이블 생성
CREATE TABLE member_series_participation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 관계
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  match_series_id UUID NOT NULL REFERENCES match_series(id) ON DELETE CASCADE,

  -- 시리즈 결과
  won BOOLEAN, -- NULL: 시리즈 미완료, TRUE: 승리, FALSE: 패배
  team TEXT NOT NULL CHECK (team IN ('blue', 'red')),

  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 제약조건: 한 멤버는 한 시리즈에 한 번만 참가
  UNIQUE(member_id, match_series_id)
);

-- 인덱스 생성 (쿼리 최적화)
CREATE INDEX idx_member_series_participation_member_id
  ON member_series_participation(member_id);

CREATE INDEX idx_member_series_participation_series_id
  ON member_series_participation(match_series_id);

CREATE INDEX idx_member_series_participation_member_created
  ON member_series_participation(member_id, created_at DESC);

-- RLS 활성화
ALTER TABLE member_series_participation ENABLE ROW LEVEL SECURITY;

-- 정책: 모든 사용자 읽기 가능
CREATE POLICY "Enable read access for all users"
  ON member_series_participation FOR SELECT
  USING (true);

-- 테이블 설명
COMMENT ON TABLE member_series_participation IS
  '멤버의 시리즈 참가 이력 (연승/연패 계산용)';

COMMENT ON COLUMN member_series_participation.won IS
  '시리즈 승리 여부 (NULL: 미완료, TRUE: 승리, FALSE: 패배)';

COMMENT ON COLUMN member_series_participation.team IS
  '소속 팀 (blue 또는 red)';
