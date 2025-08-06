'use client';

import { useEffect, useState } from "react";
import type { UserData, MenuStructure } from "@/types/user"; // o "@/types/menu" si los moviste allí

export function useUserProfile(): {
  user: UserData | null;
  menus: MenuStructure | null;
} {
  const [user, setUser] = useState<UserData | null>(null);
  const [menus, setMenus] = useState<MenuStructure | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user_data");
    const storedMenus = localStorage.getItem("user_menus");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem("user_data");
      }
    }

    if (storedMenus) {
      try {
        setMenus(JSON.parse(storedMenus));
      } catch (error) {
        console.error('Error parsing menus data:', error);
        localStorage.removeItem("user_menus");
      }
    }
  }, []);

  return { user, menus };
}

