import React from "react";
import Logo from "../logo-container";
import styles from '../styles/AboutMe.module.scss'

const Webpack = () => (
    <Logo title='Webpack'>
        <svg className={styles.webpack} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
            <path d="m300 0 265 150v300L300 600 35 450V150z"/>
            <path d="M518 440 309 558v-92l130-72 79 46zm14-13V179l-76 45v159l76 44zM82 440l208 118v-92l-130-72-79 46zm-15-13V179l77 45v159l-77 44zm9-264L290 42v89l-137 76h-1l-76-44zm447 0L309 42v89l137 76h1l76-44z"/>
            <path d="m290 445-128-71V234l128 74v137zm19 0 128-71V234l-128 74v137zm-9-142zm-129-85 129-71 129 71-129 74-129-74z"/>
        </svg>
    </Logo>
)

export default Webpack