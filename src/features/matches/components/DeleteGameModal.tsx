'use client';

import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';

interface DeleteGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  gameNumber: number;
  isDeleting: boolean;
}

export function DeleteGameModal({
  isOpen,
  onClose,
  onConfirm,
  gameNumber,
  isDeleting,
}: DeleteGameModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="게임 삭제">
      <div className="space-y-4">
        <p className="text-gray-700">
          <strong>{gameNumber}게임</strong>을 삭제하시겠습니까?
        </p>
        <p className="text-sm text-gray-500">
          ⚠️ 이 게임의 모든 플레이어 통계와 밴픽 정보가 함께 삭제됩니다.
        </p>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            취소
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? '삭제 중...' : '삭제'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
