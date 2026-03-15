export default function MeseroLayout({ children }: { children: React.ReactNode }) {
  // Layout limpio para el panel del mesero — sin carrito de clientes ni navbar público
  return <>{children}</>;
}
