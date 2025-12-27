import { MatchRegistrationForm } from '@/features/matches/components/MatchRegistrationForm';

export default function NewMatchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">경기 등록</h1>
      <MatchRegistrationForm />
    </div>
  );
}
