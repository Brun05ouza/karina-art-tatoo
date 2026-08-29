import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const PRELOADER_SRC = "/assets/IMG_0430.GIF";

interface PreloaderProps {
  ready?: boolean;
  onComplete: () => void;
}

/**
 * Cobre a tela até `ready` (conteúdo + imagens-chave).
 * Só chama onComplete depois do fade-out — evita revelar o site cedo demais.
 */
export function Preloader({ ready = true, onComplete }: PreloaderProps) {
  const [visible, setVisible] = useState(true);
  const finishing = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!ready || finishing.current) return;
    finishing.current = true;
    setVisible(false);
  }, [ready]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        onCompleteRef.current();
      }}
    >
      {visible && (
        <motion.div
          key="preloader"
          className="ks-preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          role="status"
          aria-label="Carregando Karina Sarte"
          aria-busy={!ready}
        >
          <motion.img
            className="ks-preloader-media"
            src={PRELOADER_SRC}
            alt=""
            width={2480}
            height={3508}
            decoding="async"
            draggable={false}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
