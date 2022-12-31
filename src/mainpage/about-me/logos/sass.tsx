import React from "react";
import Logo from "../logo-container";
import styles from '../styles/AboutMe.module.scss'

const Sass = () => (
    <Logo title="SASS">
        <svg className={styles.sass} xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 264 264">
            <path d="M79 187c-8 9-11 20-6 23 4 2 15-1 22-9a35 35 0 0 0 7-12c2-6 3-12 1-19l-1 1s-14 6-23 16z"/>
            <path d="M128 1a126 126 0 1 0 0 253 126 126 0 0 0 0-253zm41 113c-22 8-40 7-47 4-9-3-14-8-15-11v-4c1-1 1-1 3 2 2 2 10 8 26 6 40-4 65-36 57-53-5-12-37-17-76 2-47 24-50 44-50 51-1 21 25 31 39 47l1 1c4-2 10-3 20-3 23 0 36 15 35 28 0 11-10 15-12 16l-2-1 2-2c2-1 6-4 7-10s-3-20-26-22c-7-1-14 0-19 1 4 8 5 25-4 39-9 13-26 22-43 17-5-1-14-13-7-28s35-29 39-31c-13-11-45-27-49-50-2-6 2-22 21-40 16-16 39-27 60-35 35-12 72-5 78 18 6 22-13 48-38 58z"/>
        </svg>
    </Logo>
)

export default Sass