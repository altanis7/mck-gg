-- 추가 성능 최적화 인덱스

-- 복합 인덱스: 멤버별 경기 결과 조회 최적화
CREATE INDEX idx_game_results_member_match ON game_results(member_id, match_id);

-- 복합 인덱스: 챔피언별 통계 조회 최적화
CREATE INDEX idx_game_results_champion_member ON game_results(champion_name, member_id);

-- 복합 인덱스: 포지션별 통계 조회 최적화
CREATE INDEX idx_game_results_position_member ON game_results(position, member_id);

-- 복합 인덱스: 팀별 경기 결과 조회 최적화
CREATE INDEX idx_game_results_team_match ON game_results(team, match_id);

-- 복합 인덱스: 날짜별 경기 조회 최적화
CREATE INDEX idx_matches_date_winner ON matches(match_date DESC, winning_team);
