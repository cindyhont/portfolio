import React, { useEffect, useRef } from 'react'
import navButtons from './buttons'
import GithubButton from './github-button'
import LinkButton from './link-button'
import ThemeButton from './theme-button'
import styles from './styles/DesktopNav.module.scss'
import { useOnScrollAfterResize } from '../../common'

const 
    DesktopUnderline = () => {
        // this animation script could be replaced with just a few lines of GSAP script, 
        // but such a small animation I would write a small script instead of installing one more package
        const 
            underline = useRef<HTMLDivElement>(),
            container = useRef<HTMLDivElement>(),
            request = useRef(0),
            targets = useRef({l:0,r:0}),
            starts = useRef({l:0,r:0}),
            duration = useRef(0.3 * 1000).current, // in milliseconds
            startTime = useRef(0),
            still = useRef(true),
            animate = (timestamp:number) => {
                if (!startTime.current) startTime.current = timestamp

                const timeElapsed = timestamp - startTime.current

                if (timeElapsed >= duration) {
                    underline.current.style.left = `${targets.current.l}px`
                    underline.current.style.right = `${targets.current.r}px`
                    still.current = true
                } else {
                    underline.current.style.left = `${(targets.current.l - starts.current.l) * timeElapsed / duration + starts.current.l}px`
                    underline.current.style.right = `${(targets.current.r - starts.current.r) * timeElapsed / duration + starts.current.r}px`
                    request.current = requestAnimationFrame(animate)
                }
            },
            moveUnderlineWithAnim = (left:number,right:number) => {
                if (still.current || left !== targets.current.l || right !== targets.current.r){
                    cancelAnimationFrame(request.current)
                    targets.current = {l:left,r:right}
                    starts.current = {
                        l:+underline.current.style.left.replace('px','').trim(),
                        r:+underline.current.style.right.replace('px','').trim()
                    }
                    startTime.current = 0
                    request.current = requestAnimationFrame(animate)
                    still.current = false
                }
            },
            moveUnderlineNoAnim = (left:number,right:number) => {
                cancelAnimationFrame(request.current)
                underline.current.style.left = `${left}px`
                underline.current.style.right = `${right}px`
            },
            detectNewUnderlinePosition = (callback:(left:number,right:number)=>void) => {
                const 
                    {innerHeight,innerWidth} = window,
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
            onScrollWithAnim = () => detectNewUnderlinePosition(moveUnderlineWithAnim)
        
        useEffect(()=>{
            container.current = document.getElementById('desktop-nav') as HTMLDivElement
        },[])

        useOnScrollAfterResize(onScrollWithAnim,onScrollNoAnim,'(min-width:600px)')

        return <div className={styles.underline} ref={underline} style={{backgroundColor:'transparent'}} />
    },
    DesktopNavBar = () => {
        const 
            container = useRef<HTMLDivElement>(),
            prevScrollY = useRef(0),
            distanceScrolled = useRef(0),
            lock = useRef(false),
            onScroll = () => {
                const 
                    {scrollY} = window,
                    distance = scrollY - prevScrollY.current

                if (lock.current) distanceScrolled.current = 0
                else {
                    if (Math.sign(distance) !== Math.sign(distanceScrolled.current)) distanceScrolled.current = 0
                    distanceScrolled.current += distance
        
                    if (distanceScrolled.current > 100) container.current.classList.add(styles.hide)
                    else if (distanceScrolled.current < -100) container.current.classList.remove(styles.hide)
                }
                prevScrollY.current = scrollY
            },
            timeout = useRef<NodeJS.Timeout>(),
            setScrollEventListener = () => {
                window.removeEventListener('scroll',onScroll)
                if (window.matchMedia('(min-width:600px)').matches) window.addEventListener('scroll',onScroll,{passive:true})
            },
            onResize = () => {
                if (window.matchMedia('(min-width:600px)').matches) onScroll()
                if (!!timeout.current) clearTimeout(timeout.current)
                timeout.current = setTimeout(setScrollEventListener,100)
            },
            lockNavBar = (e:CustomEvent) => lock.current = e.detail as boolean

        useEffect(()=>{
            onResize()
            window.addEventListener('resize',onResize,{passive:true})
            container.current.addEventListener('lock',lockNavBar,{passive:true})
            return () => {
                window.removeEventListener('resize',onResize)
                container.current.removeEventListener('lock',lockNavBar)
            }
        },[])

        return (
            <div id='desktop-nav' className={styles['desktop-nav']} ref={container}>
                {navButtons.map(e=><LinkButton key={e.title} {...{...e,letterSpaceClassName:styles['letter-space']}} />)}
                <DesktopUnderline />
                <GithubButton className={styles['github-button']} />
                <ThemeButton className={styles['theme-button']} />
            </div>
        )
    }

export default DesktopNavBar