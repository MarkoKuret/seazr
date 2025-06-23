import { getSession } from '@/server/auth-action';
import { redirect } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { ReportForm } from '@/components/reports/report-form';

export default async function ReportsPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <>
      <SiteHeader title='Reports' />
      <div className='flex flex-1 flex-col'>
        <div className='@container/main flex flex-1 flex-col gap-2'>
          <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
            <div className='px-4 lg:px-6'>
              <h1 className='mb-6 text-2xl font-semibold'>Vessel Reports</h1>
              <ReportForm userId={session.user.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
