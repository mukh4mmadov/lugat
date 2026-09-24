import { motion } from "framer-motion";

export default function GlassCard({ children, className = "", delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className={`rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-2xl shadow-slate-200/70 backdrop-blur-2xl dark:border-white/10 dark:bg-white/10 dark:shadow-black/20 ${className}`}
    >
      {children}
    </motion.section>
  );
}
