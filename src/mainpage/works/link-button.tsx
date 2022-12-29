import React, { useEffect, useRef } from "react";
import { addLetterSpacing } from "../../common";
import styles from './styles/Button.module.scss'

const LinkButton = ({link,title}:{link:string;title:string;}) => {
    const ref = useRef<HTMLDivElement>()

    useEffect(()=>{
        addLetterSpacing(title,ref.current,styles['letter-space'])
    },[])

    return (
        <a className={styles.button} href={link} target='_blank' rel="noreferrer">
            <div ref={ref} />
        </a>
    )
}

export default LinkButton