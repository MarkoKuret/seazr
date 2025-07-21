import { getAllVessels } from '@/server/admin-action';
import { AdminVesselsList } from './admin-vessels-list';

export async function AdminVesselsListContainer({
  userId,
}: {
  userId: string;
}) {
  const vessels = await getAllVessels(userId);
  return <AdminVesselsList vessels={vessels} userId={userId} />;
}
