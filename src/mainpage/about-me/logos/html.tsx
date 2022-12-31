import React from 'react'
import Logo from '../logo-container'
import styles from '../styles/AboutMe.module.scss'

const HTML = () => (
    <Logo title='HTML5'>
        <svg className={styles.html} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <path d="m0 32 35 396 157 52 157-52 35-396H0zm308 128H124l5 49h175l-13 149-98 27h-2l-98-27-6-76h48l3 38 54 15 53-15 6-62H84L72 112h241l-5 48z"/>
        </svg>
    </Logo>
)

export default HTML