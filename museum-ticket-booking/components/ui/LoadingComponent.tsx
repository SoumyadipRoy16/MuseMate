import React from 'react';
import styles from './LoadingComponent.module.css'; // Import a CSS module for styling

const LoadingComponent: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.spinner}></div>
      <div className={styles.text}>Exploring the Wonders of Art and Culture...</div>
    </div>
  );
};

export default LoadingComponent;
