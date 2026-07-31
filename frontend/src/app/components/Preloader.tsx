import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const PRELOADER_SRC = "/assets/IMG_0430.GIF";

interface PreloaderProps {
  onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 900);
    }, 3200);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          className="ks-preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          role="status"
          aria-label="Carregando Karina Sarte"
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
