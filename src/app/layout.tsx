import type { Metadata } from "next";
import "./globals.css";

// Desabilitar devtools em produção
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  import('../utils/production');
}

export const metadata: Metadata = {
  title: "Lotus - Proposta de Compra",
  description: "Sistema de propostas de compra - Lotus Cidade",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Desabilitar React DevTools em produção
                if (typeof window !== 'undefined') {
                  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
                    isDisabled: true,
                    supportsFiber: true,
                    inject: function() {},
                    onCommitFiberRoot: function() {},
                    onCommitFiberUnmount: function() {}
                  };
                }
              `
            }}
          />
        )}
      </body>
    </html>
  );
}
