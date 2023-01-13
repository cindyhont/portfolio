import React from "react";
import Logo from "../logo-container";
import styles from '../styles/AboutMe.module.scss'

const MaterialUI = () => (
    <Logo title='Material UI'>
        <svg className={styles.mui} viewBox="-4 -4 44 40">
            <path d="M30 22a1 1 0 0 0 1-1v-6a1 1 0 0 1 0-1l4-1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1l-11 7a1 1 0 0 1-1 0l-10-6v-6l8-4v-5a1 1 0 0 0-2-1l-6 3a1 1 0 0 1-1 0l-5-3a1 1 0 0 0-2 1v9a1 1 0 0 1-1 1l-3-2a1 1 0 0 1-1-1V2a1 1 0 0 1 2-1l10 6a1 1 0 0 0 1 0l11-6a1 1 0 0 1 2 1v16a1 1 0 0 1-1 1l-5 3a1 1 0 0 0 0 2l3 2a1 1 0 0 0 1 0l6-4zm1-15a1 1 0 0 0 2 1l3-2a1 1 0 0 0 0-1V2a1 1 0 0 0-2-1l-3 2a1 1 0 0 0 0 1v3z" />
        </svg>
    </Logo>
)

export default MaterialUI