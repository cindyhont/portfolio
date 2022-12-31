import React, { ChangeEvent, useRef } from "react";
import navButtons from "./buttons";
import GithubButton from "./github-button";
import LinkButton from "./link-button";
import ThemeButton from "./theme-button";
import styles from './styles/MobileNav.module.scss'
import { useOnScrollAfterResize } from "../../common";

const MobileNav = () => {
    const 
        checkbox = useRef<HTMLInputElement>(),
        container = useRef<HTMLDivElement>(),
        backdropOnClick = () => {
            checkbox.current.checked = false
            document.body.style.overflowY = null
        },
        onScroll = () => {
            const 
                {innerHeight} = window,
                elements = document.querySelectorAll('.section'),
                len = elements.length

            for (let i=0; i<len; i++){
                const 
                    elem = elements[i],
                    {top,bottom} = elem.getBoundingClientRect(),
                    overlap = top >= 0 && bottom <= innerHeight
                        || top >= 0 && top <= innerHeight * 0.5
                        || bottom <= innerHeight && bottom >= innerHeight * 0.5

                if (overlap) {
                    container.current.dataset.currentSection = elem.id
                    break
                }
            }
        },
        checkboxOnChange = (e:ChangeEvent<HTMLInputElement>) => {
            document.body.style.overflowY = e.target.checked ? 'hidden' : null
        }

    useOnScrollAfterResize(onScroll,onScroll,'(max-width:599px)')
        
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
            <div className={styles['label-menu-icon']}>
                {Array.from(Array(3).keys(),(i)=>(<div key={i} />))}
            </div>
            <label htmlFor="menu-checkbox" className={styles['label-menu-checkbox']} />
        </div>
    )
}

export default MobileNav