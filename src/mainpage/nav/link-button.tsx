import React, { MouseEventHandler, useEffect, useRef } from "react";
import { addLetterSpacing, hideMobileSidebar } from "../../common";
import { useMediaQueryListener } from "../../hooks";

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
    // since I have no control over the duration of window.scroll* functions,
    // I write this script so that I can control the time of scrolling 
    // and especially when I can unlock the header nav bar

    // GSAP's ScrollToPlugin works fine in desktop but not in mobile, thus can't use

    const 
        ref = useRef<HTMLDivElement>(),
        timeout = useRef<NodeJS.Timeout>(),
        windowWidthQuery = useRef('(min-width:600px)').current,
        wideWindow = useRef(false),
        onClick = () => {
            hideMobileSidebar()

            const 
                elem = document.getElementById(title.toLowerCase()),
                {top,bottom} = elem.getBoundingClientRect(),
                {innerHeight} = window,
                overlap = top >= 0 && bottom <= innerHeight
                    || top < 0 && bottom > innerHeight
                    || top >= 0 && top <= innerHeight * 0.5
                    || bottom <= innerHeight && bottom >= innerHeight * 0.5

            if (!overlap) {
                document.getElementById('desktop-nav').dispatchEvent(new CustomEvent('lock',{detail:true}))
                setTimeout(()=>scrollBy({top:wideWindow.current ? top - 50 : top,behavior:'smooth'}),1)
                clearTimeout(timeout.current)
                timeout.current = setTimeout(()=>document.getElementById('desktop-nav').dispatchEvent(new CustomEvent('lock',{detail:false})),1000)
            }
        },
        onResize = (e:MediaQueryListEvent) => wideWindow.current = e.matches

    useEffect(()=>{
        wideWindow.current = window.matchMedia(windowWidthQuery).matches
        addLetterSpacing(title,ref.current,letterSpaceClassName)
    },[])

    useMediaQueryListener([
        {query:windowWidthQuery,func:onResize},
    ])

    return (
        <button className={`${title.toLowerCase()} ${extraClassNames || ''}`.trim()} aria-label={title} onClick={onClick}>
            <div ref={ref} />
        </button>
    )
}

export default LinkButton