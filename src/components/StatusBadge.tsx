// src/components/StatusBadge.tsx
import { STATUS_LABELS, STATUS_COLORS } from '@/types';
import type { CommandeStatus } from '@/types';

export default function StatusBadge({ statut }: { statut: CommandeStatus }) {
  return (
    <span className={`status-badge ${STATUS_COLORS[statut]}`}>
      {STATUS_LABELS[statut]}
    </span>
  );
}
