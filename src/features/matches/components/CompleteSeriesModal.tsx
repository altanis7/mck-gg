'use client';

import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';

interface CompleteSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  teamAWins: number;
  teamBWins: number;
  isCompleting: boolean;
}

export function CompleteSeriesModal({
  isOpen,
  onClose,
  onConfirm,
  teamAWins,
  teamBWins,
  isCompleting,
}: CompleteSeriesModalProps) {
  const winnerTeam = teamAWins > teamBWins ? 'team_a' : 'team_b';
  const winnerLabel = winnerTeam === 'team_a' ? 'Team A (첫 게임 블루팀)' : 'Team B (첫 게임 레드팀)';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="시리즈 완료">
      <div className="space-y-4">
        <p className="text-gray-700">시리즈를 완료하시겠습니까?</p>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-800 font-semibold mb-2">시리즈 결과</p>
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              현재 스코어:{' '}
              <span className="font-bold">
                Team A {teamAWins} - {teamBWins} Team B
              </span>
            </p>
            <p className="text-sm text-gray-600 text-xs">
              (Team A = 첫 게임 블루팀 멤버, Team B = 첫 게임 레드팀 멤버)
            </p>
            <p className="text-sm text-gray-700">
              승리팀: <span className="font-bold">{winnerLabel}</span>
            </p>
          </div>
        </div>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800 font-semibold mb-2">⚠️ 주의</p>
          <p className="text-sm text-yellow-700">
            완료 후에는 게임 추가 및 결과 수정이 불가능합니다.
          </p>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isCompleting}>
            취소
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={isCompleting}>
            {isCompleting ? '완료 처리 중...' : '시리즈 완료'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
