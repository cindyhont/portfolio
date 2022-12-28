import React, { useEffect, useRef } from "react";
import { addLetterSpacing } from "../../common";

const LinkButton = ({link,title}:{link:string;title:string;}) => {
    const ref = useRef<HTMLDivElement>()

    useEffect(()=>{
        addLetterSpacing(title,ref.current)
    },[])

    return (
        <a className='work-link' href={link} target='_blank' rel="noreferrer">
            <div ref={ref} />
        </a>
    )
}

export default LinkButton