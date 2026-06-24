import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface PreloaderProps {
  onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 800);
    }, 2000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            background: "#BAB1BA",
            zIndex: 99998,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 32,
          }}
        >
          <svg
            width="200"
            height="60"
            viewBox="0 0 200 60"
            fill="none"
            style={{ position: "absolute", top: "38%" }}
          >
            <motion.path
              d="M 10 30 Q 50 10 100 30 Q 150 50 190 30"
              stroke="#2E173A"
              strokeWidth="0.75"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }}
            />
          </svg>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ animation: "ks-star-pulse 2s ease-in-out infinite" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#2E173A">
              <path d="M12 0 L13.2 10.8 L24 12 L13.2 13.2 L12 24 L10.8 13.2 L0 12 L10.8 10.8 Z" />
            </svg>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, letterSpacing: "0.22em" }}
            transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#5B4964",
            }}
          >
            Karina Sarte
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
