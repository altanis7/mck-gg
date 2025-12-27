import { MemberList } from '@/features/members/components/MemberList';
import { ProtectedRoute } from '@/features/admin/components/ProtectedRoute';

export default function AdminMembersPage() {
  return (
    <ProtectedRoute>
      <MemberList />
    </ProtectedRoute>
  );
}
