"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ICON_MAP } from "@/lib/iconMap";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: string;
    items?: { metabaseID: number | null }[];
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const IconComponent = ICON_MAP[item.icon ?? "IconHelp"];
            const hasDashboards = item.items && item.items.length > 0 && item.items.some(i => i.metabaseID !== null);
            const firstDashboardId = hasDashboards ? item.items?.[0]?.metabaseID : null;
            
            // Si tiene dashboards, usar la ruta del dashboard, sino usar la ruta directa
            const href = firstDashboardId ? `${item.url}/${firstDashboardId}` : item.url;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={href}>
                    {IconComponent && <IconComponent size={22} />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
