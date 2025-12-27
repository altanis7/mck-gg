'use client';

import { useState } from 'react';
import { Member, CreateMemberDto } from '../api/types';
import { useMembers } from '../hooks/useMembers';
import { useCreateMember } from '../hooks/useCreateMember';
import { useUpdateMember } from '../hooks/useUpdateMember';
import { useDeleteMember } from '../hooks/useDeleteMember';
import { MemberCard } from './MemberCard';
import { MemberForm } from './MemberForm';
import { Button } from '@/shared/components/ui/Button';
import { Loading } from '@/shared/components/ui/Loading';
import { ErrorMessage } from '@/shared/components/ui/ErrorMessage';
import { Modal } from '@/shared/components/ui/Modal';

export function MemberList() {
  const { data: members, isLoading, error } = useMembers();
  const createMutation = useCreateMember();
  const updateMutation = useUpdateMember();
  const deleteMutation = useDeleteMember();

  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  async function handleCreate(data: CreateMemberDto) {
    try {
      await createMutation.mutateAsync(data);
      setShowForm(false);
    } catch (err) {
      // 에러는 Hook에서 처리
    }
  }

  async function handleUpdate(data: CreateMemberDto) {
    if (!editingMember) return;

    try {
      await updateMutation.mutateAsync({ id: editingMember.id, data });
      setEditingMember(null);
    } catch (err) {
      // 에러는 Hook에서 처리
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      // 에러는 Hook에서 처리
    }
  }

  function openCreateForm() {
    setEditingMember(null);
    setShowForm(true);
  }

  function openEditForm(member: Member) {
    setEditingMember(member);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingMember(null);
  }

  if (isLoading) {
    return <Loading size="lg" className="my-8" />;
  }

  if (error) {
    return <ErrorMessage message={error.message} className="my-8" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">멤버 관리</h1>
        <Button onClick={openCreateForm}>멤버 추가</Button>
      </div>

      {members?.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>등록된 멤버가 없습니다.</p>
          <p className="text-sm mt-2">멤버 추가 버튼을 눌러 멤버를 등록하세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members?.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onEdit={openEditForm}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editingMember ? '멤버 수정' : '멤버 추가'}
      >
        <MemberForm
          member={editingMember || undefined}
          onSubmit={editingMember ? handleUpdate : handleCreate}
          onCancel={closeForm}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </div>
  );
}
