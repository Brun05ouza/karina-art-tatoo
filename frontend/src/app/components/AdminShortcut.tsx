import { useEffect } from "react";

/**
 * Atalho de teclado para abrir a área administrativa: Ctrl + Shift + A
 * (Cmd + Shift + A no Mac).
 *
 * Abre em uma janela separada e nomeada, então pressionar o atalho de novo
 * reaproveita a mesma janela em vez de acumular várias.
 *
 * Não é um recurso de segurança: /admin é protegido pelo login e pela API. O
 * atalho só evita digitar a URL.
 */
const ADMIN_PATH = "/admin";
const ADMIN_WINDOW_NAME = "ks-admin";
const ADMIN_WINDOW_FEATURES = "width=1440,height=920";

export function AdminShortcut() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // event.code em vez de event.key: com Shift pressionado o key vira "A", e
      // em teclados não-ABNT/QWERTY o caractere pode mudar. O code aponta para a
      // tecla física e é estável em qualquer layout.
      if (event.code !== "KeyA") return;
      if (!event.shiftKey || event.altKey || event.repeat) return;
      if (!event.ctrlKey && !event.metaKey) return;

      event.preventDefault();
      const janela = window.open(ADMIN_PATH, ADMIN_WINDOW_NAME, ADMIN_WINDOW_FEATURES);
      // Bloqueador de pop-up ativo: cai para a navegação normal em vez de
      // simplesmente não fazer nada.
      if (!janela) window.location.assign(ADMIN_PATH);
      else janela.focus();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
