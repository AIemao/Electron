import styles from './Dashboard.module.css';
import type { DashboardItem } from '../types';

interface Props {
  items: DashboardItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function Dashboard({ items, selectedId, onSelect }: Props) {
  return (
    <ul className={styles.list}>
      {items.map(({ id, label, path }) => (
        <li
          key={id}
          className={id === selectedId ? styles.selected : ''}
          onClick={() => onSelect(id)}
        >
          <strong>{label}:</strong>
          <span>{path}</span>
        </li>
      ))}
    </ul>
  );
}
