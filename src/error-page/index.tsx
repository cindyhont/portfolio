import React from "react"
import Link from 'next/link'
import styles from './ErrorPage.module.scss'

const ErrorPage = ({errorCode}:{errorCode:number}) => (
    <main className={styles.errorpage}>
        {['top','bottom'].map(e=>(
            <h1 className={styles[e]} key={e}>
                <span>{errorCode}</span>
            </h1>
        ))}
        <div id='link-container'>
            <Link href='/'>
                {['top','bottom'].map(e=>(
                    <h2 className={styles[e]} key={e}>
                        <span>GO HOME ➔</span>
                    </h2>
                ))}
            </Link>
        </div>
    </main>
)

export default ErrorPage