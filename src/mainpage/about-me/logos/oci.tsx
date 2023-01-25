import React from "react";
import Logo from "../logo-container";
import styles from '../styles/AboutMe.module.scss'

const OCI = () => (
    <Logo title="Oracle Cloud Infrastructure">
        <svg className={styles.oci} viewBox="-2 0 36 21">
            <path d="M9.9,20.1c-5.5,0-9.9-4.4-9.9-9.9c0-5.5,4.4-9.9,9.9-9.9h11.6c5.5,0,9.9,4.4,9.9,9.9c0,5.5-4.4,9.9-9.9,9.9H9.9 M21.2,16.6c3.6,0,6.4-2.9,6.4-6.4c0-3.6-2.9-6.4-6.4-6.4h-11c-3.6,0-6.4,2.9-6.4,6.4s2.9,6.4,6.4,6.4H21.2" />
        </svg>
    </Logo>
)

export default OCI