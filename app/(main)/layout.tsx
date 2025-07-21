import { redirect } from 'next/navigation';
import { getSession } from '@/server/auth-action';
import { getUserVessels } from '@/server/vessel-action';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }

  const vessels = await getUserVessels(session.user.id);

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
          role: session.user.role,
        }}
      />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
