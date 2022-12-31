import React from "react";
import Logo from "../logo-container";
import styles from '../styles/AboutMe.module.scss'

const Docker = () => (
    <Logo title='Docker'>
        <svg className={styles.docker} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <path d="M230 147h48v43h-48zM230 199h48v43h-48zM174 147h48v43h-48zM286 199h48v43h-48zM230 95h48v44h-48zM118 147h48v43h-48zM174 199h48v43h-48z"/>
            <path d="M476 219c-10-7-34-9-52-6-2-17-12-32-30-46l-10-6-6 10c-14 20-17 53-3 74-6 4-19 8-35 8H28c-6 36 4 84 31 116s67 48 119 48c113 0 197-52 236-147 16 1 49 0 66-32l6-13-10-6z"/>
            <path d="M118 199h48v43h-48z"/>
        </svg>
    </Logo>
)

export default Docker