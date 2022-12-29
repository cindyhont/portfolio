import React, { useEffect } from "react";

const ThemeButton = ({className}:{className?:string}) => {
    const
        updateIcon = (dark:boolean,animate:boolean) => {
            if (animate) ['sun','moon'].forEach(e=>document.getElementById(e)?.classList.remove('no-anim'))

            const htmlTag = document.getElementsByTagName('html')[0]
            if (dark) htmlTag.dataset.theme = 'dark'
            else htmlTag.dataset.theme = 'light'
        },
        systemThemeUpdate = (e:MediaQueryListEvent) => {
            const storageValueStr = localStorage.getItem('dark')
            if (!storageValueStr) updateIcon(e.matches,true)
            else {
                const storageValue = storageValueStr === 'true'
                if (storageValue === e.matches){
                    localStorage.removeItem('dark')
                    updateIcon(e.matches,true)
                }
            }
        },
        onClick = () => {
            const darkMode = document.getElementsByTagName('html')[0].dataset.theme === 'dark'
            updateIcon(!darkMode,true)
            if (darkMode === window.matchMedia('(prefers-color-scheme: dark)').matches) localStorage.setItem('dark',(!darkMode).toString())
            else localStorage.removeItem('dark')
        }

    useEffect(()=>{
        if (!localStorage.getItem('dark')) updateIcon(window.matchMedia('(prefers-color-scheme: dark)').matches,false)
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',systemThemeUpdate)
        return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change',systemThemeUpdate)
    },[])

    return (
        <button onClick={onClick} {...(!!className && {className})} aria-label='Theme'>
            <svg viewBox="-2 -2 28 28" width='35' height='35'>
                <use href='#sun' />
                <use href='#moon' />
            </svg>
        </button>
    )
}
export default ThemeButton