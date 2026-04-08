'use client';

import React from 'react';
import styles from './Background3D.module.css';

const Background3D = () => {
  return (
    <div className={styles.background}>
      <div className={styles.mesh} />
      <div className={styles.shapes}>
        <div className={`${styles.shape} ${styles.shape1}`} />
        <div className={`${styles.shape} ${styles.shape2}`} />
        <div className={`${styles.shape} ${styles.shape3}`} />
      </div>
      <div className={styles.overlay} />
    </div>
  );
};

export default Background3D;
