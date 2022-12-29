import React from "react";
import styles from './styles/AboutMe.module.scss'

const Logo = ({title,children}:{title:string;children:JSX.Element;}) => (
    <div className={styles["about-me-skill"]}>
        <div className={styles["about-me-skill-logo"]}>
           {children}
        </div>
        <div className={styles["about-me-skill-caption"]}>{title}</div>
    </div>
)

export default Logo