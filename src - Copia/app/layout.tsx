import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000"),
  title: { default: "Groov — Sua música. Sua história.", template: "%s · Groov" },
  description: "Registre o que você ouve, descubra novos artistas, avalie álbuns e compartilhe seu gosto musical.",
  applicationName: "Groov",
  keywords: ["música","music journal","álbuns","reviews","discovery","social music"],
  openGraph: { title: "Groov — Sua música. Sua história.", description: "Ouça. Registre. Conecte.", siteName: "Groov", type: "website" },
  twitter: { card: "summary_large_image", title: "Groov — Sua música. Sua história.", description: "Ouça. Registre. Conecte." },
  icons: { icon: "/icon.svg" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body><a className="skipLink" href="#main-content">Pular para o conteúdo</a>{children}</body></html>;
}
