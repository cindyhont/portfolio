import React from "react";
import Logo from "../logo-container";
import styles from '../styles/AboutMe.module.scss'

const TailwindCSS = () => (
    <Logo title="Tailwind CSS">
        <svg className={styles.tailwindcss} viewBox="0 0 54 33">
            <g>
                <path d="M27 0c-7 0-12 4-13 11 2-4 5-5 9-4 2 0 3 2 5 3 3 3 6 6 13 6s11-3 13-11c-3 4-6 5-9 4-3 0-4-2-6-3-2-3-5-6-12-6zM14 16C6 16 2 20 0 27c3-4 6-5 9-4 3 0 4 2 6 4s5 5 12 5 12-3 14-10c-3 3-6 5-10 4l-5-4c-3-3-6-6-12-6z" />
            </g>
            <defs>
                <clipPath id="a">
                    <path d="M0 0h54v32H0z"/>
                </clipPath>
            </defs>
        </svg>
    </Logo>
)

export default TailwindCSS