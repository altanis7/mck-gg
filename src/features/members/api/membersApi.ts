import {
  Member,
  CreateMemberDto,
  UpdateMemberDto,
  MembersResponse,
  MemberResponse,
  DeleteMemberResponse,
} from './types';

// 멤버 목록 조회
export async function getMembers(): Promise<Member[]> {
  const response = await fetch('/api/members');
  const result: MembersResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || '멤버 목록 조회에 실패했습니다.');
  }

  return result.data;
}

// 멤버 상세 조회
export async function getMember(id: string): Promise<Member> {
  const response = await fetch(`/api/members/${id}`);
  const result: MemberResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || '멤버 조회에 실패했습니다.');
  }

  return result.data;
}

// 멤버 생성
export async function createMember(data: CreateMemberDto): Promise<Member> {
  const response = await fetch('/api/members', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result: MemberResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || '멤버 생성에 실패했습니다.');
  }

  return result.data;
}

// 멤버 수정
export async function updateMember(
  id: string,
  data: UpdateMemberDto
): Promise<Member> {
  const response = await fetch(`/api/members/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result: MemberResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || '멤버 수정에 실패했습니다.');
  }

  return result.data;
}

// 멤버 삭제
export async function deleteMember(id: string): Promise<void> {
  const response = await fetch(`/api/members/${id}`, {
    method: 'DELETE',
  });

  const result: DeleteMemberResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || '멤버 삭제에 실패했습니다.');
  }
}
