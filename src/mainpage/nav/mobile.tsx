import React, { ChangeEvent, useEffect, useRef } from "react";
import navButtons from "./buttons";
import GithubButton from "./github-button";
import LinkButton from "./link-button";
import ThemeButton from "./theme-button";
import styles from './styles/MobileNav.module.scss'

const MobileNav = () => {
    const 
        checkbox = useRef<HTMLInputElement>(),
        container = useRef<HTMLDivElement>(),
        labelRef = useRef<HTMLLabelElement>(),
        backdropOnClick = () => {
            checkbox.current.checked = false
            document.body.style.overflowY = null
        },
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
                    if (bottom < innerHeight + 10) labelRef.current.classList.add(styles.away)
                    else labelRef.current.classList.remove(styles.away)
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
        },
        checkboxOnChange = (e:ChangeEvent<HTMLInputElement>) => {
            document.body.style.overflowY = e.target.checked ? 'hidden' : null
        }

    useEffect(()=>{
        onResize()
        window.addEventListener('resize',onResize)
        return () => window.removeEventListener('resize',onResize)
    },[])
        
    return (
        <div className={styles['mobile-nav']}>
            <input ref={checkbox} onChange={checkboxOnChange} type='checkbox' id='menu-checkbox' className={styles['menu-checkbox']} hidden />
            <div className={styles["menu-backdrop"]} onClick={backdropOnClick} />
            <div className={styles["menu-container"]} ref={container}>
                {navButtons.map(e=><LinkButton key={e.title} {...{...e,letterSpaceClassName:styles['letter-space'],extraClassNames:styles[e.title.toLowerCase()]}} />)}
                <div className={styles["icon-buttons"]}>
                    <GithubButton />
                    <ThemeButton className={styles['theme-button']} />
                </div>
            </div>
            <label htmlFor="menu-checkbox" ref={labelRef} className={styles['label-menu-checkbox']}>
                {Array.from(Array(3).keys(),(i)=>(<div key={i} />))}
            </label>
        </div>
    )
}

export default MobileNav