import React, { ChangeEvent, useRef } from "react";
import navButtons from "./buttons";
import GithubButton from "./github-button";
import LinkButton from "./link-button";
import ThemeButton from "./theme-button";
import styles from './styles/MobileNav.module.scss'

const MobileNav = () => {
    const 
        checkbox = useRef<HTMLInputElement>(),
        backdropOnClick = () => {
            checkbox.current.checked = false
            document.body.style.overflowY = null
        },
        checkboxOnChange = (e:ChangeEvent<HTMLInputElement>) => {
            document.body.style.overflowY = e.target.checked ? 'hidden' : null
        }
        
    return (
        <div className={styles['mobile-nav']}>
            <input ref={checkbox} onChange={checkboxOnChange} type='checkbox' id='menu-checkbox' className={styles['menu-checkbox']} hidden />
            <div className={styles["menu-backdrop"]} onClick={backdropOnClick} />
            <div className={styles["menu-container"]}>
                {navButtons.map(e=><LinkButton key={e.title} {...{...e,letterSpaceClassName:styles['letter-space'],extraClassNames:styles[e.title.toLowerCase()]}} />)}
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