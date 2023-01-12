import React, { useEffect, useRef } from "react";
import { addLetterSpacing } from "../functions";
import styles from './Button.module.scss'

const LinkButton = (
    {
        link,
        title,
        className,
    }:{
        link:string;
        title:string;
        className?:string;
    }
) => {
    const ref = useRef<HTMLDivElement>()

    useEffect(()=>{
        addLetterSpacing(title,ref.current,styles['letter-space'])
    },[])

    return (
        <a className={`${styles.button} ${className}`.trim()} href={link} target='_blank' rel="noreferrer">
            <div ref={ref} />
        </a>
    )
}

export default LinkButton