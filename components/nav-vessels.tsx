'use client';

import { IconSpeedboat } from '@tabler/icons-react';
//import { Sailboat } from 'lucide-react';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Vessel } from '@/types';

export function NavVessels({
  vessels,
  currentPath,
}: {
  vessels: Vessel[];
  currentPath: string;
}) {
  if (!vessels || vessels.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>My Vessels</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {vessels.map((vessel) => (
            <SidebarMenuItem key={vessel.id}>
              <SidebarMenuButton
                asChild
                className={
                  currentPath === `/vessels/${vessel.shortId}`
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                    : ''
                }
              >
                <a
                  href={`/vessels/${vessel.shortId}?name=${encodeURIComponent(vessel.name)}`}
                >
                  <IconSpeedboat />
                  <span>{vessel.name}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
