import { apiClient } from '@/lib/axios';
import {
  Member,
  CreateMemberDto,
  UpdateMemberDto,
  MembersResponse,
  MemberResponse,
  DeleteMemberResponse,
} from './types';

// 멤버 목록 조회
export async function getMembers(): Promise<MembersResponse> {
  return await apiClient.get<MembersResponse>('/members');
}

// 멤버 상세 조회
export async function getMember(id: string): Promise<MemberResponse> {
  return await apiClient.get<MemberResponse>(`/members/${id}`);
}

// 멤버 생성
export async function createMember(data: CreateMemberDto): Promise<MemberResponse> {
  return await apiClient.post<MemberResponse>('/members', data);
}

// 멤버 수정
export async function updateMember(
  id: string,
  data: UpdateMemberDto
): Promise<MemberResponse> {
  return await apiClient.patch<MemberResponse>(`/members/${id}`, data);
}

// 멤버 삭제
export async function deleteMember(id: string): Promise<DeleteMemberResponse> {
  return await apiClient.delete<DeleteMemberResponse>(`/members/${id}`);
}
