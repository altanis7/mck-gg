import { SeriesCreationForm } from '@/features/matches/components/SeriesCreationForm';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/Button';

export default function NewMatchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">새 시리즈 등록</h1>
        <Link href="/admin/matches">
          <Button variant="outline">← 목록으로</Button>
        </Link>
      </div>
      <SeriesCreationForm />
    </div>
  );
}
