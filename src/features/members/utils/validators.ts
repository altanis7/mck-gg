import { CreateMemberDto, UpdateMemberDto } from '../api/types';

// 이름 검증
export function validateName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: '이름을 입력해주세요.' };
  }

  if (name.length > 50) {
    return { valid: false, error: '이름은 50자 이하여야 합니다.' };
  }

  return { valid: true };
}

// 소환사명 검증
export function validateSummonerName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: '소환사명을 입력해주세요.' };
  }

  if (name.length > 50) {
    return { valid: false, error: '소환사명은 50자 이하여야 합니다.' };
  }

  return { valid: true };
}

// 포지션 검증
export function validatePosition(position: string): { valid: boolean; error?: string } {
  const validPositions = ['top', 'jungle', 'mid', 'adc', 'support'];

  if (!validPositions.includes(position.toLowerCase())) {
    return { valid: false, error: '올바른 포지션을 선택해주세요.' };
  }

  return { valid: true };
}

// 멤버 생성 데이터 검증
export function validateCreateMember(data: CreateMemberDto): { valid: boolean; error?: string } {
  // 이름 검증
  const nameCheck = validateName(data.name);
  if (!nameCheck.valid) {
    return nameCheck;
  }

  // 소환사명 검증
  const summonerNameCheck = validateSummonerName(data.summoner_name);
  if (!summonerNameCheck.valid) {
    return summonerNameCheck;
  }

  // Riot ID 필수 검증
  if (!data.riot_id || data.riot_id.trim().length === 0) {
    return { valid: false, error: 'Riot ID를 입력해주세요.' };
  }

  // 주 포지션 검증
  const mainPositionCheck = validatePosition(data.main_position);
  if (!mainPositionCheck.valid) {
    return mainPositionCheck;
  }

  // 부 포지션 검증 (있을 경우만)
  if (data.sub_position) {
    const subPositionCheck = validatePosition(data.sub_position);
    if (!subPositionCheck.valid) {
      return subPositionCheck;
    }
  }

  return { valid: true };
}

// 멤버 수정 데이터 검증
export function validateUpdateMember(data: UpdateMemberDto): { valid: boolean; error?: string } {
  // 이름 검증 (있을 경우)
  if (data.name) {
    const nameCheck = validateName(data.name);
    if (!nameCheck.valid) {
      return nameCheck;
    }
  }

  // 소환사명 검증 (있을 경우)
  if (data.summoner_name) {
    const summonerNameCheck = validateSummonerName(data.summoner_name);
    if (!summonerNameCheck.valid) {
      return summonerNameCheck;
    }
  }

  // Riot ID 검증 (있을 경우)
  if (data.riot_id !== undefined && data.riot_id.trim().length === 0) {
    return { valid: false, error: 'Riot ID를 입력해주세요.' };
  }

  // 주 포지션 검증 (있을 경우)
  if (data.main_position) {
    const mainPositionCheck = validatePosition(data.main_position);
    if (!mainPositionCheck.valid) {
      return mainPositionCheck;
    }
  }

  // 부 포지션 검증 (있을 경우)
  if (data.sub_position) {
    const subPositionCheck = validatePosition(data.sub_position);
    if (!subPositionCheck.valid) {
      return subPositionCheck;
    }
  }

  return { valid: true };
}
