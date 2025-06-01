'use client';

import * as React from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import {
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconHelp,
  IconReport,
  IconSearch,
  IconSettings,
} from '@tabler/icons-react';


import { NavDocuments } from '@/components/nav-documents';
import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconDashboard,
    },
    {
      title: 'Analytics',
      url: '#',
      icon: IconChartBar,
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '#',
      icon: IconSettings,
    },
    {
      title: 'Get Help',
      url: '#',
      icon: IconHelp,
    },
    {
      title: 'Search',
      url: '#',
      icon: IconSearch,
    },
  ],
  management: [
    {
      name: 'Manage Vessels',
      url: '/vessels', // Update this URL
      icon: IconDatabase,
    },
    {
      name: 'Reports',
      url: '#',
      icon: IconReport,
    },
  ],
};

// makni usera u djeljen fajl !?
interface User {
  name: string;
  email: string;
  image: string;
}

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & {user: User}) {
  const pathname = usePathname();
  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className='mt-2 mb-2 data-[slot=sidebar-menu-button]:!p-1.5'
            >
              <a href='#'>
                <Image
                  src='/logo.svg'
                  alt='Logo'
                  width={32}
                  height={32}
                  className='h-16 w-32'
                />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} currentPath={pathname}/>
        <NavDocuments items={data.management} currentPath={pathname}/>
        <NavSecondary items={data.navSecondary} className='mt-auto' />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
