import dynamic from "next/dynamic";

const EmpresasApp = dynamic(() => import("@/components/empresas/EmpresasApp"), {
  ssr: false,
  loading: () => (
    <div className="nx-splash">
      <p>Cargando Nominapp Empresas</p>
    </div>
  ),
});

export default function EmpresasPage() {
  return <EmpresasApp />;
}
