'use client';

import { useState } from 'react';
import { PlayerMatchDetail } from '../api/types';
import { PlayerMatchCardHeader } from './PlayerMatchCardHeader';
import { GameResultsDisplay } from '@/features/matches/components/GameResultsDisplay';

interface PlayerMatchAccordionProps {
  match: PlayerMatchDetail;
  playerId: string;
  defaultOpen?: boolean;
}

export function PlayerMatchAccordion({
  match,
  playerId,
  defaultOpen = false,
}: PlayerMatchAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      <div onClick={() => setIsOpen(!isOpen)}>
        <PlayerMatchCardHeader
          match={match}
          playerId={playerId}
          isOpen={isOpen}
        />
      </div>

      {isOpen && (
        <div className="border-t border-slate-700">
          <GameResultsDisplay game={match.game} />
        </div>
      )}
    </div>
  );
}
