'use client';

import { use } from 'react';
import { PlayerStatsPage } from '@/features/members/components/PlayerStatsPage';

export default function MemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <PlayerStatsPage memberId={id} />;
}
