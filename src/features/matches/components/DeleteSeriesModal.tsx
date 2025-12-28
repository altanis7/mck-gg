'use client';

import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';

interface DeleteSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  seriesDate: string;
  seriesType: string;
  gameCount: number;
  isDeleting: boolean;
}

export function DeleteSeriesModal({
  isOpen,
  onClose,
  onConfirm,
  seriesDate,
  seriesType,
  gameCount,
  isDeleting,
}: DeleteSeriesModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="시리즈 삭제">
      <div className="space-y-4">
        <p className="text-gray-700">
          <strong>
            {new Date(seriesDate).toLocaleDateString('ko-KR')} {seriesType}
          </strong>{' '}
          시리즈를 삭제하시겠습니까?
        </p>
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800 font-semibold mb-2">⚠️ 경고</p>
          <p className="text-sm text-red-700">
            이 시리즈의 모든 데이터가 영구적으로 삭제됩니다:
          </p>
          <ul className="text-sm text-red-700 list-disc list-inside mt-2 space-y-1">
            <li>등록된 게임 {gameCount}개</li>
            <li>모든 플레이어 통계</li>
            <li>모든 밴픽 기록</li>
          </ul>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            취소
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? '삭제 중...' : '시리즈 삭제'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
