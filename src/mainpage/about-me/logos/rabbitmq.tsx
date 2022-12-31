import React from "react";
import Logo from "../logo-container";
import styles from '../styles/AboutMe.module.scss'

const RabbitMQ = () => (
    <Logo title="RabbitMQ">
        <svg className={styles.rabbitmq} xmlns="http://www.w3.org/2000/svg" viewBox="-6 -5 53 52">
            <path d="M39 17H27a2 2 0 0 1-2-1V3a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v13a2 2 0 0 1-2 1h-4a2 2 0 0 1-2-1V3a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v37a2 2 0 0 0 2 1h36a2 2 0 0 0 2-1V19a2 2 0 0 0-2-2Zm-6 14a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-3h4a2 2 0 0 1 2 3v3Z"/>
        </svg>
    </Logo>
)

export default RabbitMQ