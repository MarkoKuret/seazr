'use client';

import { IconCirclePlusFilled, type Icon } from '@tabler/icons-react';
import {
  IconDots,
  IconFolder,
  IconShare3,
  IconTrash,
} from '@tabler/icons-react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,

} from '@/components/ui/sidebar';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,

} from '@/components/ui/dropdown-menu';

export function NavMain({
  items,
  currentPath,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
  currentPath: string;
}) {

  const { isMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupContent className='flex flex-col gap-2'>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild className={currentPath === item.url ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground' : ''}>
              <a href={item.url}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </a>
            </SidebarMenuButton>
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction
                  showOnHover
                  className='data-[state=open]:bg-accent rounded-sm'
                >
                  <IconDots />
                  <span className='sr-only'>More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-24 rounded-lg'
                side={isMobile ? 'bottom' : 'right'}
                align={isMobile ? 'end' : 'start'}
              >
                <DropdownMenuItem>
                  <IconFolder />
                  <span>Open</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconShare3 />
                  <span>Share</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant='destructive'>
                  <IconTrash />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
