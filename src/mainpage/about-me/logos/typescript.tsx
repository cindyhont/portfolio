import React from "react";
import Logo from "../logo-container";
import styles from '../styles/AboutMe.module.scss'

const Typescript = () => (
    <Logo title='Typescript'>
        <svg className={styles.typescript} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path d="M0 0h512v512H0z"/>
            <path d="M317 407v50c8 4 18 7 29 9a198 198 0 0 0 69 0c11-2 20-6 28-11s15-12 19-21a76 76 0 0 0 3-56c-3-7-7-13-12-18s-11-10-18-14l-24-12-18-8-13-8c-4-2-6-5-8-8a18 18 0 0 1-1-19c2-3 4-5 8-7l12-5 16-2a92 92 0 0 1 27 4l14 5 12 7v-47c-8-3-16-5-25-6l-31-3c-12 0-23 2-34 4s-20 7-28 12a59 59 0 0 0-26 51c0 15 4 28 13 38 8 11 22 19 39 27l19 9 15 8 10 9a20 20 0 0 1 1 21c-1 3-4 6-7 8l-12 4c-5 2-10 2-17 2-11 0-22-2-32-6-11-3-21-9-30-17zm-84-123h64v-41H118v41h64v183h51z"/>
        </svg>
    </Logo>
)

export default Typescript