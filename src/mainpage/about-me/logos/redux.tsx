import React from "react";
import Logo from "../logo-container";
import styles from '../styles/AboutMe.module.scss'

const Redux = () => (
    <Logo title='Redux'>
        <svg className={styles.redux} xmlns="http://www.w3.org/2000/svg" viewBox="5 5 90 90">
            <path d="M66 65c2 0 5-2 5-5-1-3-3-6-6-6a6 6 0 0 0-4 10c-3 6-9 11-16 15-6 3-11 4-17 4-4-1-8-3-10-6-3-5-3-11-1-16 2-4 5-7 7-8l-1-5C8 58 10 73 14 79c4 5 10 8 18 8h6c12-3 22-10 28-22z"/>
            <path d="M83 53c-7-9-19-14-31-14h-2c-1-2-3-3-5-3a6 6 0 0 0 0 11c3 0 4-1 5-3h2c8 0 15 2 21 7 5 3 9 7 11 12 2 4 1 9 0 12-3 5-8 8-14 8l-10-2-4 4c4 2 8 3 13 3 9 0 16-5 19-11s3-16-5-24z"/>
            <path d="M32 67c0 3 3 5 6 5a6 6 0 0 0 0-11h-1c-4-6-6-14-5-22 0-6 2-11 6-15 3-4 8-6 12-6 11 0 15 13 15 18l6 2c-2-16-12-25-21-25s-18 7-21 16c-4 13-1 26 4 35l-1 3z"/>
        </svg>
    </Logo>
)

export default Redux