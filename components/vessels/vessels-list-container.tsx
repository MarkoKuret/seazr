import { getUserVessels } from '@/server/vessel-action';
import { VesselsList } from './vessels-list';

export async function VesselsListContainer({ userId }: { userId: string }) {
  const vessels = await getUserVessels(userId);

  return <VesselsList vessels={vessels} userId={userId} />;
}