import React from "react";
import Logo from "../logo-container";
import styles from '../styles/AboutMe.module.scss'

const CSS = () => (
    <Logo title='CSS3'>
        <svg className={styles.css} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <path d="m0 32 35 396 157 52 157-52 35-396H0zm313 80-5 47-115 50h111l-13 146-98 29-99-29-6-74h49l3 38 53 13 54-15 4-61-166-1-4-46 112-47 7-3H77l-6-47h242z" />
        </svg>
    </Logo>
)

export default CSS