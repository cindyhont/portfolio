import React from "react";
import Logo from "../logo-container";
import styles from '../styles/AboutMe.module.scss'

const Javascript = () => (
    <Logo title='Javascript'>
        <svg className={styles.javascript} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path d="M0 32v448h448V32H0zm244 349c0 44-26 64-63 64-34 0-53-18-63-39l34-20c7 11 13 21 27 21s23-5 23-26V238h42v143zm99 64c-39 0-64-19-76-43l34-20c9 15 21 26 42 26 17 0 28-9 28-21 0-15-11-20-31-28l-10-5c-30-13-51-29-51-63 0-32 25-56 62-56 27 0 46 10 60 34l-33 21c-7-13-15-18-27-18s-20 8-20 18c0 13 8 18 26 26l10 4c36 15 56 31 56 66 0 38-30 59-70 59z"/>
        </svg>
    </Logo>
)

export default Javascript