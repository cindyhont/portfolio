import React, { useEffect, useRef } from 'react'
import navButtons from './buttons'
import GithubButton from './github-button'
import LinkButton from './link-button'
import ThemeButton from './theme-button'
import styles from './styles/DesktopNav.module.scss'
import { useEventListeners, useOnScrollAfterResize } from '../../hooks'

const 
    DesktopNavBarUnderline = () => {
        const underline = useRef<HTMLDivElement>()

        useEffect(()=>{
            setTimeout(()=>{
                underline.current.style.transition = 'background-color var(--mode-transition-time), transform 0.5s'
                underline.current.style.backgroundColor = 'var(--text-color)';
            },1000)
        },[])

        return <div className={styles.underline} id='desktop-nav-underline' ref={underline} />
    },
    DesktopNavBar = () => {
        const 
            container = useRef<HTMLDivElement>(),
            prevScrollY = useRef(0),
            distanceScrolled = useRef(0),
            lock = useRef(false),
            onScroll = () => {
                // hide navbar while scrolling up

                const 
                    {scrollY} = window,
                    distance = scrollY - prevScrollY.current

                if (lock.current) distanceScrolled.current = 0
                else {
                    if (Math.sign(distance) !== Math.sign(distanceScrolled.current)) distanceScrolled.current = 0
                    distanceScrolled.current += distance
        
                    if (distanceScrolled.current > 80) container.current.classList.add(styles.hide)
                    else if (distanceScrolled.current < -80) container.current.classList.remove(styles.hide)
                }
                prevScrollY.current = scrollY
            },
            lockNavBar = (e:CustomEvent) => lock.current = e.detail as boolean

        useOnScrollAfterResize(onScroll,onScroll,'(min-width:600px)')

        useEventListeners([
            {elem:container,evt:'lock',func:lockNavBar}
        ])
        
        return (
            <div id='desktop-nav' className={styles['desktop-nav']} ref={container}>
                {navButtons.map(e=><LinkButton key={e} {...{title:e,letterSpaceClassName:styles['letter-space']}} />)}
                <DesktopNavBarUnderline />
                <GithubButton className={styles['github-button']} />
                <ThemeButton className={styles['theme-button']} />
            </div>
        )
    }

export default DesktopNavBar