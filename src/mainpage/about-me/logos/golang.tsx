import React from "react";
import Logo from "../logo-container";
import styles from '../styles/AboutMe.module.scss'

const Golang = () => (
    <Logo title="Go">
        <svg className={styles.go} viewBox="0 0 207 78" xmlns="http://www.w3.org/2000/svg">
            <path d="m16 24 2-3 1-1h36v1l-2 3h-1zM1 33l2-3h47l-1 3h-1zM25 43v-1l1-3h22v3l-1 1zM129 22l-17 5-3-1-4-4c-7-3-13-2-18 1-7 5-11 11-11 19s6 15 14 16c7 1 12-1 17-6l3-4H90c-2 0-2-1-2-3l5-11c1-1 1-2 3-2h36v8c-1 8-4 14-8 20-8 10-17 15-29 17-10 1-19-1-27-7-7-5-11-13-13-22-1-11 2-20 9-29S80 4 92 2c9-2 18-1 26 5 6 3 10 8 12 14 1 1 0 1-1 1z"/>
            <path d="M162 78c-9-1-17-3-24-9-6-5-10-12-11-20-2-11 1-21 8-30s16-14 28-16c10-2 20-1 29 5 7 5 12 12 14 22 1 14-3 25-12 34-6 7-15 11-24 13l-8 1zm24-41v-3c-2-10-11-16-21-13-9 2-15 8-17 17-2 8 2 16 9 19 5 2 11 2 16-1 8-4 12-10 13-19z"/>
        </svg>
    </Logo>
)

export default Golang