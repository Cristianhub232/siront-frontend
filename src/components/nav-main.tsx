"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ICON_MAP } from "@/lib/iconMap";
import { Badge } from "@/components/ui/badge";

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
          {items.map((item, index) => {
            // Verificar si es el menú de Reportes de Cierre, Formas No Validadas, Creación de Conceptos o Notificaciones para agregar separador
            const isReportesCierre = item.title === "Reportes de Cierre";
            const isFormasNoValidadas = item.title === "Formas No Validadas";
            const isCreacionConceptos = item.title === "Creación de Conceptos";
            const isNotificaciones = item.title === "Notificaciones";
            const isSpecialModule = isReportesCierre || isFormasNoValidadas || isCreacionConceptos || isNotificaciones;
            const previousItem = items[index - 1];
            const shouldAddSeparator = isSpecialModule && previousItem && !(previousItem.title === "Reportes de Cierre" || previousItem.title === "Formas No Validadas" || previousItem.title === "Creación de Conceptos" || previousItem.title === "Notificaciones");
            
            // Obtener el icono correcto
            const IconComponent = ICON_MAP[item.icon ?? "IconHelp"] || ICON_MAP["IconHelp"];
            const hasDashboards = item.items && item.items.length > 0 && item.items.some(i => i.metabaseID !== null);
            const firstDashboardId = hasDashboards ? item.items?.[0]?.metabaseID : null;
            
            // Si tiene dashboards, usar la ruta del dashboard, sino usar la ruta directa
            const href = firstDashboardId ? `${item.url}/${firstDashboardId}` : item.url;

            return (
              <div key={item.title}>
                {/* Separador visual antes de los módulos especiales */}
                {shouldAddSeparator && (
                  <div className="my-4 px-3">
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    <div className="text-xs text-gray-500 text-center mt-2 font-medium">
                      ✨ MÓDULOS ESPECIALES
                    </div>
                  </div>
                )}
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild
                    className={isSpecialModule ? "nav-item-special" : "nav-item"}
                  >
                    <a 
                      href={href}
                      className={isSpecialModule ? 
                        "relative bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 rounded-lg" : 
                        "group relative transition-all duration-300 hover:bg-blue-50 hover:text-blue-700 rounded-lg"
                      }
                    >
                      {IconComponent && (
                        <IconComponent 
                          size={22} 
                          className={`nav-icon ${isSpecialModule ? "text-white" : "text-gray-600 group-hover:text-blue-600"} transition-colors duration-300`}
                        />
                      )}
                      <span className={`${isSpecialModule ? "font-semibold" : "font-medium"} transition-all duration-300`}>
                        {item.title}
                      </span>
                      {isSpecialModule && (
                        <>
                          {/* Badge de "NUEVO" */}
                          <Badge 
                            variant="secondary" 
                            className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs font-bold px-1 py-0.5 animate-pulse"
                          >
                            NUEVO
                          </Badge>
                          {/* Efecto de brillo */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine" />
                        </>
                      )}
                      {/* Efecto de hover para elementos normales */}
                      {!isSpecialModule && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                      )}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              </div>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
