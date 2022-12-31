import React from "react";
import Logo from "../logo-container";
import styles from '../styles/AboutMe.module.scss'

const Nginx = () => (
    <Logo title="Nginx">
        <svg className={styles.nginx} xmlns="http://www.w3.org/2000/svg" viewBox="11 -3 31 66">
            <path d="M0 45a3 3 0 0 0 2 1l23 13a3 3 0 0 0 3 0l23-13a3 3 0 0 0 2-3V16a3 3 0 0 0-2-2L28 0a3 3 0 0 0-3 0L2 14a3 3 0 0 0-2 2v27a3 3 0 0 0 0 2"/>
            <path d="M19 40a3 3 0 0 1-6 0V20a3 3 0 0 1 3-3 5 5 0 0 1 4 2l1 1 13 15V20a3 3 0 1 1 6 0v20a3 3 0 0 1-4 3 5 5 0 0 1-4-2L19 25v15Z"/>
        </svg>
    </Logo>
)

export default Nginx