import React from "react";
import Logo from "../logo-container";
import styles from '../styles/AboutMe.module.scss'

const ThreeJS = () => (
    <Logo title="Three.js">
        <svg className={styles.threejs} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 227 227">
            <path d="M72 205 29 30l173 50z"/>
            <path d="m115 55 22 87-87-25z"/>
            <path d="M94 129 83 86l43 12zM72 42l11 44-43-12zM158 67l11 44-43-13zM94 129l11 44-43-13z"/>
        </svg>
    </Logo>
)

export default ThreeJS