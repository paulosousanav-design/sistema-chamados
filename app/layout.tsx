import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Chame o Técnico | Sistema Integrado',
  description: 'Plataforma unificada de gestão de ordens de serviço e parceiros técnicos.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#0B1026] text-[#FFFFFF] antialiased min-h-screen flex flex-col">
        
        {/* BARRA DE NAVEGAÇÃO GLOBAL */}
        <nav className="bg-[#16213E] border-b border-[#2E3B63] p-3 flex justify-center items-center gap-3 sm:gap-6 text-[10px] sm:text-xs font-bold uppercase tracking-wider overflow-x-auto whitespace-nowrap shadow-md sticky top-0 z-50">
          <Link href="/" className="hover:text-[#FF7A00] transition-colors text-[#B8C0CC] py-1 flex items-center gap-1.5">
            📝 Nova OS
          </Link>
          <span className="text-[#2E3B63]">|</span>
          
          <Link href="/admin" className="hover:text-[#FF7A00] transition-colors text-[#B8C0CC] py-1 flex items-center gap-1.5">
            💻 Painel Admin
          </Link>
          <span className="text-[#2E3B63]">|</span>
          
          <Link href="/tecnico" className="hover:text-[#FF7A00] transition-colors text-[#B8C0CC] py-1 flex items-center gap-1.5">
            🔧 Portal Técnico
          </Link>
          <span className="text-[#2E3B63]">|</span>
          
          <Link href="/cadastro-parceiro" className="hover:text-[#FF7A00] transition-colors text-[#B8C0CC] py-1 flex items-center gap-1.5">
            🤝 Novo Parceiro
          </Link>
        </nav>

        {/* Aqui é onde as suas páginas (page.tsx) vão ser carregadas */}
        <div className="flex-1">
          {children}
        </div>

      </body>
    </html>
  );
}