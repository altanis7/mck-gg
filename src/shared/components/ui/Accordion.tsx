import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AccordionProps {
  isOpen: boolean;
  onToggle: () => void;
  header: ReactNode;
  content: ReactNode;
  headerClassName?: string;
}

export function Accordion({
  isOpen,
  onToggle,
  header,
  content,
  headerClassName,
}: AccordionProps) {
  return (
    <div className="rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className={cn('w-full text-left transition-colors', headerClassName)}
        aria-expanded={isOpen}
        type="button"
      >
        {header}
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-200 ease-in-out',
          isOpen ? 'max-h-[5000px]' : 'max-h-0'
        )}
      >
        {content}
      </div>
    </div>
  );
}
