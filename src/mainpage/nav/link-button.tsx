import React, { useEffect, useRef } from "react";
import { addLetterSpacing } from "../../common";

const LinkButton = (
    {
        title,
        letterSpaceClassName,
        extraClassNames,
    }:{
        title:string;
        letterSpaceClassName:string;
        extraClassNames?:string;
    }
) => {
    const 
        ref = useRef<HTMLDivElement>(),
        fromTop = useRef(0),
        request = useRef(0),
        onScroll = () => {
            if (fromTop.current === window.scrollY) document.getElementById('desktop-nav').dispatchEvent(new CustomEvent('lock',{detail:false}))
            else {
                fromTop.current = window.scrollY
                request.current = requestAnimationFrame(onScroll)
            }
        },
        onClick = () => {
            (document.getElementById('menu-checkbox') as HTMLInputElement).checked = false
            document.body.style.overflowY = null

            const 
                elem = document.getElementById(title.toLowerCase()),
                {top,bottom} = elem.getBoundingClientRect(),
                {innerHeight} = window,
                overlap = top >= 0 && bottom <= innerHeight
                    || top < 0 && bottom > innerHeight
                    || top >= 0 && top <= innerHeight * 0.5
                    || bottom <= innerHeight && bottom >= innerHeight * 0.5

            if (!overlap) {
                cancelAnimationFrame(request.current)
                fromTop.current = -1
                document.getElementById('desktop-nav').dispatchEvent(new CustomEvent('lock',{detail:true}))
                window.scrollBy({
                    top:window.matchMedia('(min-width:600px)').matches ? top - 50 : top,
                    behavior:'smooth'
                })
                setTimeout(()=>request.current = requestAnimationFrame(onScroll),300)
            }
        }

    useEffect(()=>{
        addLetterSpacing(title,ref.current,letterSpaceClassName)
    },[])

    return (
        <button className={`${title.toLowerCase()} ${extraClassNames || ''}`} aria-label={title} onClick={onClick}>
            <div ref={ref} />
        </button>
    )
}

export default LinkButton