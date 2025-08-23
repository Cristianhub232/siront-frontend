// app/layout.tsx

import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { UserProvider } from "@/context/UserContext";
import { AppProvider } from "@/context/AppContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SIRONT - ONT",
  description: "Sistema de Reportes ONT",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta name="referrer" content="no-referrer-when-downgrade" />
      </head>
      <body className={`${inter.className} bg-gray-100`}>
        <AppProvider>
          <AuthProvider>
            <UserProvider>
              <Toaster position="top-right" />
              <main>{children}</main>
            </UserProvider>
          </AuthProvider>
        </AppProvider>
      </body>
    </html>
  );
}
