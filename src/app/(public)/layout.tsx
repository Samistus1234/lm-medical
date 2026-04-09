import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { WhatsAppFAB } from "@/components/public/whatsapp-fab";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <WhatsAppFAB />
    </>
  );
}
