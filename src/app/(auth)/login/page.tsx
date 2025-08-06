"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext"; // Asegúrate de que la ruta sea correcta
import { toast } from "sonner";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { signIn } = useAuth();

const handleLogin = async (event: React.FormEvent) => {
  event.preventDefault();

  try {
    await signIn({ username, password });
    // El toast de éxito ya lo maneja internamente `signIn()`
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al iniciar sesión";
    toast.error(message);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#cbd3dc] to-[#f6f8fb] flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center">
          <img src="/logo-ont.webp" alt="Logo ONT" className="h-32 w-auto mb-4" style={{ minWidth: '300px' }} />
          <h1 className="text-lg text-center text-gray-700 mb-6">
            SIRONT - Sistema de Reportes ONT
          </h1>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Ingrese su usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-700 mb-6"
            required
          />
          <input
            type="password"
            placeholder="Ingrese su contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-700 mb-6"
            required
          />
          <div className="flex justify-between items-center text-sm text-gray-600">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" /> Recuérdame
            </label>
            <a href="#" className="text-red-600 hover:underline">
              ¿Olvidó su contraseña?
            </a>
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Inicio de sesión
          </button>
        </form>
      </div>
    </div>
  );
}
