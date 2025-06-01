'use client';

import {
  IconDots,
  IconFolder,
  IconShare3,
  IconTrash,
  type Icon,
} from '@tabler/icons-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

export function NavDocuments({
  items,
  currentPath
}: {
  items: {
    name: string;
    url: string;
    icon: Icon;
  }[];
  currentPath: string;
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup className='group-data-[collapsible=icon]:hidden'>
      <SidebarGroupLabel>Management</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild className={currentPath === item.url ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground' : ''}>
              <a href={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>

          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
