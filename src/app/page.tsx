import Calendar from '@/components/Calendar/Calendar';
import Background3D from '@/components/Background3D/Background3D';
import SettingsTray from '@/components/SettingsTray/SettingsTray';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <Background3D />
      <SettingsTray />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Zenith Calendar</h1>
          <p className={styles.subtitle}>Elevate your everyday planning with precision.</p>
        </div>

        <Calendar />

        <footer className={styles.footer}>
          <p>&copy; 2026 Zenith Design.</p>
        </footer>
      </div>
    </main>
  );
}
