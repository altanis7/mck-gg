// 비밀번호 검증
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: '비밀번호를 입력해주세요.' };
  }

  if (password.length < 4) {
    return { valid: false, error: '비밀번호가 너무 짧습니다.' };
  }

  return { valid: true };
}
