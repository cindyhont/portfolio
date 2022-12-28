import React, { useEffect, useRef } from "react";
import navButtons from "./buttons";
import GithubButton from "./github-button";
import LinkButton from "./link-button";
import ThemeButton from "./theme-button";

const MobileNav = () => {
    const 
        checkbox = useRef<HTMLInputElement>(),
        container = useRef<HTMLDivElement>(),
        labelRef = useRef<HTMLLabelElement>(),
        backdropOnClick = () => checkbox.current.checked = false,
        onScroll = () => {
            const 
                {innerHeight} = window,
                elements = document.querySelectorAll('.section'),
                len = elements.length

            let done = 0

            for (let i=0; i<len; i++){
                const 
                    elem = elements[i],
                    {top,bottom} = elem.getBoundingClientRect(),
                    overlap = top >= 0 && bottom <= innerHeight
                        || top >= 0 && top <= innerHeight * 0.5
                        || bottom <= innerHeight && bottom >= innerHeight * 0.5

                if (elem.id === 'contact'){
                    if (bottom < innerHeight + 10) labelRef.current.classList.add('away')
                    else labelRef.current.classList.remove('away')
                    done ++
                } 

                if (overlap) {
                    container.current.dataset.currentSection = elem.id
                    done ++
                }
                
                if (done === 2) break
            }
        },
        timeout = useRef<NodeJS.Timeout>(),
        setScrollEventListener = () => {
            window.removeEventListener('scroll',onScroll)
            if (window.matchMedia('(max-width:599px)').matches) window.addEventListener('scroll',onScroll)
        },
        onResize = () => {
            if (window.matchMedia('(max-width:599px)').matches) onScroll()
            else checkbox.current.checked = false

            if (!!timeout.current) clearTimeout(timeout.current)
            timeout.current = setTimeout(setScrollEventListener,100)
        }

    useEffect(()=>{
        onResize()
        window.addEventListener('resize',onResize)
        return () => window.removeEventListener('resize',onResize)
    },[])
        
    return (
        <div id='mobile-nav'>
            <input ref={checkbox} type='checkbox' id='menu-checkbox' hidden />
            <div className="menu-backdrop" onClick={backdropOnClick} />
            <div className="menu-container" ref={container}>
                {navButtons.map(e=><LinkButton key={e.title} {...e} />)}
                <div className="icon-buttons">
                    <GithubButton />
                    <ThemeButton />
                </div>
            </div>
            <label htmlFor="menu-checkbox" ref={labelRef}>
                {Array.from(Array(3).keys(),(i)=>(<div key={i} />))}
            </label>
        </div>
    )
}

export default MobileNav