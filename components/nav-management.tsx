'use client';

import React from 'react';
import { type Icon } from 'lucide-react';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function NavManagement({
  items,
  currentPath,
}: {
  items: {
    name: string;
    url: string;
    icon: typeof Icon;
  }[];
  currentPath: string;
}) {
  //const { isMobile } = useSidebar(); ?!

  return (
    <SidebarGroup className='group-data-[collapsible=icon]:hidden'>
      <SidebarGroupLabel>Management</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              asChild
              className={
                currentPath === item.url
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                  : ''
              }
            >
              <a href={item.url}>
                {React.createElement(item.icon)}
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
