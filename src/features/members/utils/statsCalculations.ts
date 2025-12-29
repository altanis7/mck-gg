/**
 * 통계 계산 유틸리티 함수
 */

// KDA 계산
export function calculateKDA(kills: number, deaths: number, assists: number): number {
  if (deaths === 0) return kills + assists;
  return (kills + assists) / deaths;
}

// KDA 포맷팅 (소수점 2자리)
export function formatKDA(kda: number): string {
  return kda.toFixed(2);
}

// KDA 색상 반환 (OP.GG 스타일)
export function getKdaColor(kda: number): string {
  if (kda >= 5.0) return '#ff8200'; // 오렌지
  if (kda >= 4.0) return '#0093ff'; // 파란색
  if (kda >= 3.0) return '#00bba3'; // 청록색
  return '#758592'; // 회색
}

// 승률 색상 반환
export function getWinRateColor(winRate: number): string {
  if (winRate >= 60) return '#d31a45'; // 빨간색 (높은 승률)
  return '#758592'; // 회색
}

// 분당 CS 계산
export function calculateCSPerMin(cs: number, durationSeconds: number): number {
  if (durationSeconds === 0) return 0;
  return cs / (durationSeconds / 60);
}

// 분당 CS 포맷팅
export function formatCSPerMin(csPerMin: number): string {
  return csPerMin.toFixed(1);
}

// 딜량 포맷팅 (k 단위)
export function formatDamage(damage: number): string {
  if (damage >= 1000) {
    return `${(damage / 1000).toFixed(1)}k`;
  }
  return damage.toString();
}

// 포지션 짧은 이름 반환
export function getPositionShort(position: string): string {
  const map: Record<string, string> = {
    top: 'TOP',
    jungle: 'JUG',
    mid: 'MID',
    adc: 'ADC',
    support: 'SUP',
  };
  return map[position.toLowerCase()] || position.toUpperCase();
}

// 포지션 한글 이름 반환
export function getPositionKorean(position: string): string {
  const map: Record<string, string> = {
    top: '탑',
    jungle: '정글',
    mid: '미드',
    adc: '원딜',
    support: '서폿',
  };
  return map[position.toLowerCase()] || position;
}

// 게임 시간 포맷팅 (초 -> MM:SS)
export function formatGameDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
