
export const metadata = {
  title: 'Chame o Técnico - Painel de Chamados',
  description: 'Sistema de ordens de serviço e chamados técnicos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
