import { RoleMenuPermission, Menu } from "@/models/index";

type MenuSection = 'main' | 'secondary' | 'document';

interface MenuResponse {
  navMain: MenuNodeRoot[];
  navSecondary: SecondaryItem[];
  documents: DocumentItem[];
}

interface RawMenuItem {
  id: string;
  key: string;
  label: string;
  icon: string | null;
  route: string;
  parentId: string | null;
  orden: number;
  section: MenuSection;
  status: boolean;
  metabaseID?: number | null;
  permissions: {
    canView: boolean;
    canEdit: boolean;
  };
}

type MenuNodeChild = {
  id: string;
  title: string;
  url: string;
  metabaseID?: number | null;
  icon: string | null;
};

type MenuNodeRoot = {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  items: MenuNodeChild[];
};

type SecondaryItem = {
  title: string;
  url: string;
  icon: string;
};

type DocumentItem = {
  name: string;
  url: string;
  icon: string;
};

type NodeMapItem = MenuNodeRoot & { parentId: string | null };

export async function getMenusByRole(
  role: string,
  options?: { onlyDisabled?: boolean }
): Promise<MenuResponse> {
  try {
    const isAdmin = role === "admin";
    
    const where = options?.onlyDisabled
      ? { status: false }
      : isAdmin
        ? undefined
        : { status: true };

    // Para admin, obtener todos los menús sin join
    if (isAdmin) {
      const rawMenus = await Menu.findAll({
        where: { status: true },
        order: [["orden", "ASC"]],
        raw: true,
      }) as unknown as RawMenuItem[];

      const navMain: MenuNodeRoot[] = [];
      const navSecondary: SecondaryItem[] = [];
      const documents: DocumentItem[] = [];

      for (const menu of rawMenus) {
        const baseNode = {
          id: menu.id,
          title: menu.label,
          url: menu.route,
          icon: menu.icon,
          parentId: menu.parentId,
          items: [],
        };

        if (menu.section === 'main') {
          navMain.push(baseNode);
        } else if (menu.section === 'secondary') {
          navSecondary.push({
            title: baseNode.title,
            url: baseNode.url,
            icon: baseNode.icon ?? 'IconHelp',
          });
        } else if (menu.section === 'document') {
          documents.push({
            name: baseNode.title,
            url: baseNode.url,
            icon: baseNode.icon ?? 'IconDatabase',
          });
        }
      }

      return { navMain, navSecondary, documents };
    }

    // Para usuarios no admin, usar la consulta original
    const rawMenus = await Menu.findAll({
      include: [
        {
          model: RoleMenuPermission,
          as: "permissions",
          where: { can_view: true, role_id: role },
          required: true,
        },
      ],
      where,
      order: [["orden", "ASC"]],
      raw: true,
      nest: true,
    }) as unknown as RawMenuItem[];

    const navMain: MenuNodeRoot[] = [];
    const navSecondary: SecondaryItem[] = [];
    const documents: DocumentItem[] = [];

    const nodeMap: Record<string, NodeMapItem> = {};

    for (const menu of rawMenus) {
      const baseNode = {
        id: menu.id,
        title: menu.label,
        url: menu.route,
        icon: menu.icon,
        parentId: menu.parentId,
        items: [],
      };

      if (menu.section === 'main') {
        nodeMap[menu.id] = baseNode;
      } else if (menu.section === 'secondary') {
        navSecondary.push({
          title: baseNode.title,
          url: baseNode.url,
          icon: baseNode.icon ?? 'IconHelp',
        });
      } else if (menu.section === 'document') {
        documents.push({
          name: baseNode.title,
          url: baseNode.url,
          icon: baseNode.icon ?? 'IconDatabase',
        });
      }
    }

    for (const id in nodeMap) {
      const node = nodeMap[id];
      if (node.parentId && nodeMap[node.parentId]) {
        nodeMap[node.parentId].items?.push(node);
      } else {
        navMain.push(node);
      }
    }

    for (const parent of navMain) {
      parent.items = Array.isArray(parent.items)
        ? parent.items.map((child): MenuNodeChild => {
          const raw = rawMenus.find(m => m.id === child.id);
          return {
            id: child.id,
            title: child.title,
            url: child.url,
            icon: child.icon,
            metabaseID: raw?.metabaseID ?? null,
          };
        })
        : [];
    }

    return { navMain, navSecondary, documents };
  } catch (error) {
    console.error("❌ Error en getMenusByRole:", error);
    throw error;
  }
}
