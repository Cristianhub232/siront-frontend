"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserData } from "@/context/UserContext";
import { toast } from "sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  signIn: (credentials: {
    username: string;
    password: string;
  }) => Promise<void>;
  updateUser: (userData: any) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  logout: async () => {},
  signIn: async () => {},
  updateUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [checking, setChecking] = useState(true); // Evita estados falsos al cargar
  const { setUser, setMenus } = useUserData();
  const router = useRouter();

  // Verifica la sesión al iniciar
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Fallo en verificación");

        const { valid, user, menus } = await res.json();

        if (valid && user?.id) {
          setUser(user);
          setMenus(menus);
          localStorage.setItem("user_data", JSON.stringify(user));
          localStorage.setItem("user_menus", JSON.stringify(menus));
        } else {
          clearSession();
        }
      } catch (err) {
        console.error("❌ Error al verificar sesión:", err);
        clearSession();
      } finally {
        setChecking(false);
      }
    };

    verifySession();
  }, [setUser, setMenus]);

  // Iniciar sesión
  const signIn = async (credentials: {
    username: string;
    password: string;
  }) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        throw new Error(result.error || "Credenciales inválidas");
      }

      // Cargar perfil desde /api/me
      const profileRes = await fetch("/api/me", {
        method: "GET",
        credentials: "include", // ← ENVÍA la cookie
        headers: { Accept: "application/json" },
      });
      if (!profileRes.ok) throw new Error("Error cargando perfil");

      const { user, menus } = await profileRes.json();
      setUser(user);
      setMenus(menus);

      localStorage.setItem("user_data", JSON.stringify(user));
      localStorage.setItem("user_menus", JSON.stringify(menus));

      // Redirigir al dashboard después del login exitoso
      router.push("/dashboard");
    } catch (error: any) {
      console.error("⛔ Error en signIn:", error);
      toast.error(error?.message || "Error al iniciar sesión");
      throw error;
    }
  };

  // Cerrar sesión
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    clearSession();
    router.push("/login");
  };

  const clearSession = () => {
    setUser(null);
    setMenus(null);
    localStorage.removeItem("user_data");
    localStorage.removeItem("user_menus");
  };

  const updateUser = (userData: any) => {
    setUser(userData);
    localStorage.setItem("user_data", JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated:
          !checking && localStorage.getItem("user_data") !== null,
        logout,
        signIn,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
