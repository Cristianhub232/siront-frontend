"use client";

import * as React from "react";
import { IconInnerShadowTop } from "@tabler/icons-react";
import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useUserProfile } from "@/hooks/useUserProfile";
import type { MenuNodeRoot } from "@/types/user";


export function AppSidebar({...props }) {
  const { user, menus } = useUserProfile(); 
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-3 bg-red-500/90 rounded-full" />
                <span className="text-base font-semibold">SIRONT</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={
            (menus?.navMain || []).map((item: MenuNodeRoot) => ({
              ...item,
              icon: item.icon === null ? undefined : item.icon,
            }))
          }
        />
        <NavDocuments items={menus?.documents || []} />
        <NavSecondary items={menus?.navSecondary || []} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user ?? { avatar: "", username: "", email: "" }} />
      </SidebarFooter>
    </Sidebar>
  );
}