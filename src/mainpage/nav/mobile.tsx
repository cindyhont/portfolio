import React, { ChangeEvent, useRef } from "react";
import navButtons from "./buttons";
import GithubButton from "./github-button";
import LinkButton from "./link-button";
import ThemeButton from "./theme-button";
import styles from './styles/MobileNav.module.scss'
import { useMediaQueryListener, useWindowEventListeners } from "../../hooks";

const MobileNav = () => {
    const 
        checkbox = useRef<HTMLInputElement>(),
        backdrop = useRef<HTMLDivElement>(),
        hideSidebar = () => {
            if (checkbox.current.checked) checkbox.current.click()
        },
        checkboxOnChange = (e:ChangeEvent<HTMLInputElement>) => {
            const checked = e.target.checked
            document.body.style.overflowY = checked ? 'hidden' : null

            if (checked) backdrop.current.addEventListener('click',hideSidebar)
            else backdrop.current.removeEventListener('click',hideSidebar)
        },
        keyEscOnPress = (e:KeyboardEvent) => {
            if (['Esc','Escape'].includes(e.key)) hideSidebar()
        }

    useWindowEventListeners([
        {evt:'keyup',func:keyEscOnPress},
    ])

    useMediaQueryListener([
        {query:'(min-width:600px)',func:hideSidebar},
    ])
    
    return (
        <div className={styles['mobile-nav']}>
            <input ref={checkbox} onChange={checkboxOnChange} type='checkbox' id='menu-checkbox' className={styles['menu-checkbox']} hidden />
            <div className={styles["menu-backdrop"]} ref={backdrop} />
            <div className={styles["menu-container"]}>
                {navButtons.map(e=><LinkButton key={e} {...{title:e,letterSpaceClassName:styles['letter-space'],extraClassNames:styles[e.toLowerCase()]}} />)}
                <div className={styles["icon-buttons"]}>
                    <GithubButton />
                    <ThemeButton className={styles['theme-button']} />
                </div>
            </div>
            {/* in mobile chrome, icon in label doesn't animate when the checkbox status changes */}
            <div className={styles['label-menu-icon']}>
                {Array.from(Array(3).keys(),(i)=>(<div key={i} />))}
            </div>
            <label htmlFor="menu-checkbox" className={styles['label-menu-checkbox']} />
        </div>
    )
}

export default MobileNav