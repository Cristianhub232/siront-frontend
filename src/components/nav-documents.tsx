"use client";

import { IconDots } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";


import { IconCirclePlusFilled } from "@tabler/icons-react";


import Link from "next/link";
import { ModalSearch } from "@/components/modalSearch";

export function NavDocuments({
  items,
}: {
  items: {
    name: string;
    url: string;
    icon?: string;
  }[];
}) {


  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Documents</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
            return (
            <SidebarMenuItem
              key={item.name}
              className="flex items-center gap-2"
            >
              <SidebarMenuButton
                tooltip="Quick Create"
                className="py-4 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
              >
                <Link href={item.url} className="flex items-center gap-2">
                  <IconCirclePlusFilled />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
              <ModalSearch />
             </SidebarMenuItem>
          );
        })}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <IconDots className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
