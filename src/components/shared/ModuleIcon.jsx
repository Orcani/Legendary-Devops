import {
  Activity, BookOpen, Boxes, Cloud, Code, Container, FileCode, Gauge, GitBranch,
  Layers, Network, Server, ShieldCheck, Terminal, Workflow, Wrench,
} from 'lucide-react'
import { couleurTexteSur } from '../../lib/format'

// Correspondance explicite nom → composant : seules ces icônes sont embarquées.
// Ajouter ici toute nouvelle valeur du champ `icon` de dataApp.json.
const ICONES = {
  activity: Activity, 'book-open': BookOpen, boxes: Boxes, cloud: Cloud, code: Code,
  container: Container, 'file-code': FileCode, gauge: Gauge, 'git-branch': GitBranch,
  layers: Layers, network: Network, server: Server, 'shield-check': ShieldCheck,
  terminal: Terminal, workflow: Workflow, wrench: Wrench,
}

/** Tuile carrée aux couleurs du module, avec son icône. */
export default function ModuleIcon({ icon, couleur = '#3B82F6', taille = 'md' }) {
  const Icone = ICONES[icon] || BookOpen
  const dims = taille === 'lg' ? 'w-14 h-14 rounded-2xl' : 'w-11 h-11 rounded-xl'
  return <span className={'inline-flex items-center justify-center shrink-0 ' + dims}
    style={{ backgroundColor: couleur, color: couleurTexteSur(couleur) }} aria-hidden="true">
    <Icone size={taille === 'lg' ? 28 : 22} strokeWidth={2}/>
  </span>
}
