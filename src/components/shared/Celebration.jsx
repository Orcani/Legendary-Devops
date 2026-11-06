import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const COULEURS = ['#F2C14E', '#5B67CF', '#9BA6F2', '#34D399', '#F59E9E', '#FBEBC2']

/**
 * Pluie de confettis courte (1,8 s), jouée une fois, sans son ni texte qui clignote.
 * Rien n'est animé si le système demande de réduire les animations.
 * `intensity` : nombre de confettis (un petit succès en mérite moins qu'un niveau gagné).
 */
export default function Celebration({ intensity = 60 }) {
  const reduire = useReducedMotion()
  const pieces = useMemo(
    () =>
      Array.from({ length: intensity }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        derive: (Math.random() - 0.5) * 30,
        delai: Math.random() * 0.35,
        duree: 1.2 + Math.random() * 0.6,
        rotation: (Math.random() - 0.5) * 720,
        taille: 6 + Math.random() * 6,
        couleur: COULEURS[i % COULEURS.length],
        rond: i % 3 === 0,
      })),
    [intensity],
  )
  if (reduire) return null
  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
      aria-hidden="true"
      data-testid="celebration"
    >
      {pieces.map(p => (
        <motion.span
          key={p.id}
          className="absolute top-0 block"
          style={{
            left: p.x + 'vw',
            width: p.taille,
            height: p.rond ? p.taille : p.taille * 0.45,
            background: p.couleur,
            borderRadius: p.rond ? '50%' : 2,
          }}
          initial={{ y: -20, x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: '95vh', x: p.derive + 'vw', rotate: p.rotation, opacity: [1, 1, 0] }}
          transition={{ duration: p.duree, delay: p.delai, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}
