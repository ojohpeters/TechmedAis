import { UsersManager } from "@/components/admin/users-manager";

export const metadata = { title: "Admin · Users" };

export default function AdminUsersPage({ searchParams }: { searchParams: { focus?: string } }) {
  return <UsersManager focusId={searchParams.focus} />;
}
