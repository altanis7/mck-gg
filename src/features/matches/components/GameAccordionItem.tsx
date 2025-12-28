import { Accordion } from '@/shared/components/ui/Accordion';
import { GameAccordionHeader } from './GameAccordionHeader';
import { GameResultsDisplay } from './GameResultsDisplay';
import { GameDetail } from '../api/types';

interface GameAccordionItemProps {
  game: GameDetail;
  isOpen: boolean;
  onToggle: () => void;
}

export function GameAccordionItem({ game, isOpen, onToggle }: GameAccordionItemProps) {
  return (
    <Accordion
      isOpen={isOpen}
      onToggle={onToggle}
      header={<GameAccordionHeader game={game} isOpen={isOpen} />}
      content={<GameResultsDisplay game={game} />}
    />
  );
}
