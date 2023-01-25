import React from "react";
import Logo from "../logo-container";
import styles from '../styles/AboutMe.module.scss'

const Heroku = () => (
    <Logo title="Heroku">
        <svg className={styles.heroku} viewBox="0 -5 72 90">
        <path d="M65 0H7C3 0 0 3 0 7v66c0 4 3 7 7 7h58c4 0 7-3 7-7V7c0-4-3-7-7-7ZM18 68V52l9 8-9 8Zm28 0V44c0-2-1-4-5-4-8 0-17 4-17 4l-6 3V12h8v23c4-2 10-3 15-3s8 2 10 4c3 3 3 7 3 8v24h-8Zm2-43h-8c3-4 5-8 6-13h8c-1 5-2 9-6 13Z"/>
        </svg>
    </Logo>
)

export default Heroku