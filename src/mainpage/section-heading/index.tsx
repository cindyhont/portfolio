import React from "react";
import styles from './SectionHeading.module.scss'

const SectionHeading = (
    {
        text,
        className,
    }:{
        text:string;
        className?:string;
    }
) => (
    <div className={`${styles.container} ${className || ''}`.trim()}>
        <h2 className={styles.back}>{text}</h2>
        <h2 className={styles.front}>{text}</h2>
    </div>
)

export default SectionHeading