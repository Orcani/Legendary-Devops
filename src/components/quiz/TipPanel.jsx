import { motion, AnimatePresence } from 'framer-motion'
export default function TipPanel({ astuce, isVisible }) {
  return <AnimatePresence>{astuce && isVisible && <motion.div initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
    <div className="panel mt-3"><h2 className="font-bold mb-2 text-blue-600 dark:text-blue-400">Astuce DevOps</h2><p className="text-sm">{astuce}</p></div>
  </motion.div>}</AnimatePresence>
}
