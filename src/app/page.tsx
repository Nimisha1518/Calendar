import Calendar from '@/components/Calendar/Calendar';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Interactive Wall Calendar</h1>
          <p className={styles.subtitle}>A premium experience for your plans</p>
        </div>
        
        <Calendar />
        
        <footer className={styles.footer}>
          <p>&copy; 2026 Premium Design Challenge. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
