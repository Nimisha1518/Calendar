'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Sun, Moon, RotateCcw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './SettingsTray.module.css';

const SettingsTray = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('zenith-theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('zenith-theme', newTheme);
  };

  const resetAll = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className={styles.settingsWrapper}>
      <motion.button
        className={styles.fab}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Settings size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.tray}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            <div className={styles.trayHeader}>
              <h3>Display Settings</h3>
              <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.settingItem}>
              <span>Theme Mode</span>
              <button onClick={toggleTheme} className={styles.toggleBtn}>
                {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
              </button>
            </div>

            <div className={styles.settingItem}>
              <span>Reset UI & Notes</span>
              <button onClick={resetAll} className={styles.resetBtn}>
                <RotateCcw size={18} />
                <span>Format</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsTray;
