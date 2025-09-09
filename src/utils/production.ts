// Utilitários para produção - desabilitar devtools
export const isProduction = process.env.NODE_ENV === 'production';

// Desabilitar React DevTools em produção
if (isProduction && typeof window !== 'undefined') {
  // Ocultar React DevTools
  (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    isDisabled: true,
    supportsFiber: true,
    inject: () => {},
    onCommitFiberRoot: () => {},
    onCommitFiberUnmount: () => {}
  };

  // Remover console.log em produção
  console.log = () => {};
  console.warn = () => {};
  console.info = () => {};
}