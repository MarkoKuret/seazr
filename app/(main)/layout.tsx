import { redirect } from 'next/navigation';
import { getSession } from '@/server/auth-action';
import { getUserVessels } from '@/server/vessel-action';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Vessel } from '@/types';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }

  const vessels: Vessel[] = (await getUserVessels(session.user.id)).map(
    (v) => ({
      ...v,
      description: v.description === null ? undefined : v.description,
    })
  );

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant='inset'
        vessels={vessels}
        user={{
          name: session.user.name,
          email: session.user.email,
          image: '/avatars/shadcn.jpg',
        }}
      />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
