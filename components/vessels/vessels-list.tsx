import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getUserVessels } from '@/server/vessel-action';

export async function VesselsList({ userId }: { userId: string }) {
  const vessels = await getUserVessels(userId);

  if (vessels.length === 0) {
    return (
      <div className='px-4 lg:px-6'>
        <Card className='border-dashed'>
          <CardContent className='pt-6 text-center'>
            <p className='text-muted-foreground'>
              No vessels added yet. Add your first vessel to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='grid gap-4 px-4 md:grid-cols-2 lg:grid-cols-3 lg:px-6'>
      {vessels.map((vessel) => (
        <Card key={vessel.id}>
          <CardHeader>
            <CardTitle>{vessel.name}</CardTitle>
            <CardDescription>ID: {vessel.shortId}</CardDescription>
          </CardHeader>
          <CardContent>
            {vessel.description ? (
              <p>{vessel.description}</p>
            ) : (
              <p className='text-muted-foreground italic'>No description</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
