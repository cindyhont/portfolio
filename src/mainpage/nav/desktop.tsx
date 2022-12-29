import gsap from 'gsap'
import React, { useEffect, useRef } from 'react'
import navButtons from './buttons'
import GithubButton from './github-button'
import LinkButton from './link-button'
import ThemeButton from './theme-button'
import styles from './styles/DesktopNav.module.scss'
// import homeStyles from '../../../styles/Home.module.scss'

const DesktopNavBar = () => {
    const 
        underline = useRef<HTMLDivElement>(),
        container = useRef<HTMLDivElement>(),
        prevScrollY = useRef(0),
        distanceScrolled = useRef(0),
        lock = useRef(false),
        moveUnderlineNoAnim = (left:number,right:number) => {
            underline.current.style.left = `${left}px`
            underline.current.style.right = `${right}px`
        },
        moveUnderlineWithAnim = (left:number,right:number) => {
            gsap.to(underline.current,{
                left,
                right,
                duration:0.5
            })
        },
        detectNewUnderlinePosition = (callback:(left:number,right:number)=>void) => {
            const 
                {innerHeight,innerWidth,scrollY} = window,
                elements = document.querySelectorAll('.section'),
                len = elements.length,
                distance = scrollY - prevScrollY.current

            if (lock.current) distanceScrolled.current = 0
            else {
                if (Math.sign(distance) !== Math.sign(distanceScrolled.current)) distanceScrolled.current = 0
                distanceScrolled.current += distance
    
                if (distanceScrolled.current > 100) container.current.classList.add(styles.hide)
                else if (distanceScrolled.current < -100) container.current.classList.remove(styles.hide)
            }
            prevScrollY.current = scrollY

            for (let i=0; i<len; i++){
                const 
                    elem = elements[i],
                    {top,bottom} = elem.getBoundingClientRect(),
                    overlap = top >= 0 && bottom <= innerHeight
                        || top >= 0 && top <= innerHeight * 0.5
                        || bottom <= innerHeight && bottom >= innerHeight * 0.5

                if (overlap) {
                    const 
                        button = container.current.getElementsByClassName(elem.id)[0],
                        {left,right} = button.getBoundingClientRect(),
                        currentLeft = +underline.current.style.left.replace('px','').trim(),
                        currentRight = +underline.current.style.right.replace('px','').trim()

                    if (left + 20 !== currentLeft || innerWidth - right + 20 !== innerWidth - currentRight){
                        underline.current.style.backgroundColor = null
                        callback(left + 20,innerWidth - right + 20)
                    }
                    break
                }
            }
        },
        onScrollNoAnim = () => detectNewUnderlinePosition(moveUnderlineNoAnim),
        onScrollWithAnim = () => detectNewUnderlinePosition(moveUnderlineWithAnim),
        timeout = useRef<NodeJS.Timeout>(),
        setScrollEventListener = () => {
            window.removeEventListener('scroll',onScrollWithAnim)
            if (window.matchMedia('(min-width:600px)').matches) window.addEventListener('scroll',onScrollWithAnim)
        },
        onResize = () => {
            if (window.matchMedia('(min-width:600px)').matches) onScrollNoAnim()
            if (!!timeout.current) clearTimeout(timeout.current)
            timeout.current = setTimeout(setScrollEventListener,100)
        },
        lockNavBar = (e:CustomEvent) => lock.current = e.detail as boolean

    useEffect(()=>{
        onResize()
        window.addEventListener('resize',onResize)
        container.current.addEventListener('lock',lockNavBar)
        return () => {
            window.removeEventListener('resize',onResize)
            container.current.removeEventListener('lock',lockNavBar)
        }
    },[])

    return (
        <div id='desktop-nav' className={styles['desktop-nav']} ref={container}>
            {navButtons.map(e=><LinkButton key={e.title} {...{...e,letterSpaceClassName:styles['letter-space']}} />)}
            <div className={styles.underline} ref={underline} style={{backgroundColor:'var(--background-color)'}} />
            <GithubButton className={styles['github-button']} />
            <ThemeButton className={styles['theme-button']} />
        </div>
    )
}

export default DesktopNavBar