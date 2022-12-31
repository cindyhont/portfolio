import React from "react";
import Logo from "../logo-container";
import styles from '../styles/AboutMe.module.scss'

const NextJS = () => (
    <Logo title="NextJS">
        <svg className={styles.nextjs} xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 265 265">
            <path d="M120 0h-4a128 128 0 1 0 73 241l-21-28-21-28-25-38-26-38a2062 2062 0 0 0-1 76l-2 2-5 1h-5l-1-1-2-2V84l1-1 2-2 5-1c6 0 6 1 8 2a4753 4753 0 0 1 81 123l20 31 1-1a131 131 0 0 0 57-88l1-19-1-19A129 129 0 0 0 120 0Zm52 77 3 3v91l-8-12-8-12v-33a980 980 0 0 1 3-36l5-1h5Z"/>
        </svg>
    </Logo>
)

export default NextJS