import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { DocumentEditor } from "../components/DocumentEditor";
import { AdminButton, AdminCard, AdminPage } from "../components/Primitives";
import { ConfirmDialog } from "../components/States";
import { resetToMocks } from "../data/localStore";
import { settingsStore } from "../data/stores";
import type { SettingsDocument } from "../data/types";
import { useToast } from "../hooks/useToast";

export function SettingsPage() {
  const [confirmReset, setConfirmReset] = useState(false);
  const { show } = useToast();
  return <AdminPage eyebrow="Dados gerais" title="Configurações" description="Centralize contatos, SEO e mensagens automáticas usadas pelo site."><DocumentEditor<SettingsDocument> store={settingsStore} blocks={[
    { title: "Informações do site", fields: [{ key: "siteName", label: "Nome do site" }, { key: "city", label: "Cidade" }, { key: "whatsapp", label: "WhatsApp" }, { key: "instagram", label: "Instagram" }, { key: "portfolioUrl", label: "Portfólio do desenvolvedor" }] },
    { title: "SEO e compartilhamento", fields: [{ key: "seoTitle", label: "Título para buscadores" }, { key: "seoDescription", label: "Descrição", type: "textarea" }, { key: "shareImageUrl", label: "Imagem de compartilhamento", type: "image" }] },
    { title: "Mensagens do WhatsApp", fields: [{ key: "whatsappBudget", label: "Orçamento", type: "textarea" }, { key: "whatsappFlash", label: "Flash tattoos", type: "textarea" }, { key: "whatsappProducts", label: "Produtos", type: "textarea" }, { key: "whatsappReformulation", label: "Reformulações", type: "textarea" }] },
  ]} /><AdminCard title="Dados de exemplo" description="Remove todos os rascunhos deste navegador e restaura o conteúdo inicial." action={<AdminButton tone="danger" onClick={() => setConfirmReset(true)}><RotateCcw size={16} />Restaurar dados</AdminButton>}><p className="ksa-muted">Use esta ação somente se quiser descartar todas as alterações locais feitas no painel.</p></AdminCard><ConfirmDialog open={confirmReset} title="Restaurar todos os dados?" text="Todos os rascunhos locais serão apagados e os exemplos originais voltarão." onCancel={() => setConfirmReset(false)} onConfirm={() => { resetToMocks(); setConfirmReset(false); show("Dados de exemplo restaurados."); window.setTimeout(() => window.location.reload(), 500); }} /></AdminPage>;
}
