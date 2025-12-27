'use client';

import { Member } from '../api/types';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';

interface MemberCardProps {
  member: Member;
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
}

export function MemberCard({ member, onEdit, onDelete }: MemberCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{member.name}</h3>
                {member.is_guest && (
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                    용병
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">{member.summoner_name}</p>
            </div>
          </div>

          {member.riot_id && (
            <p className="text-sm text-gray-600">Riot ID: {member.riot_id}</p>
          )}

          {member.solo_tier && member.solo_rank && (
            <p className="text-sm font-medium text-gray-700">
              {member.solo_tier} {member.solo_rank}
            </p>
          )}

          <div className="flex gap-1 flex-wrap">
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              {member.main_position.toUpperCase()}
            </span>
            {member.sub_position && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                {member.sub_position.toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="outline" onClick={() => onEdit(member)}>
              수정
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(member.id)}
            >
              삭제
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
