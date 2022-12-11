import React, { useEffect, useRef } from "react";
import Head from 'next/head';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/dist/ScrollTrigger';
import matter from 'gray-matter'
import fs from 'fs'
import { join } from 'path'
import { GetStaticProps } from 'next'
import { IindexItem } from "../src/interfaces";
import { IndexContext } from "../src/context";
import Diamonds from "../src/mainpage/diamonds";
import { closeAllModals } from "../src/common";
import Bottle from "../src/mainpage/bottle";
import FlockOnSphere from "../src/mainpage/flockonsphere";
import FpsCounter from "../src/mainpage/fps-counter";
import Cinema from "../src/mainpage/cinema";

export const getStaticProps:GetStaticProps = async () => {
    const 
        root = join (process.cwd (), 'src', 'works', 'mdx'),
        listing = fs.readdirSync(root)

    let works:IindexItem[] = []

    listing.forEach(async filename=>{
        if (!filename.endsWith('.mdx')) return
        const 
            buf = fs.readFileSync(join(root,filename)),
            m = matter(buf,{excerpt_separator: '<!-- excerpt end -->'})

        works.push({
            ...m.data as IindexItem,
            excerpt:m.excerpt,
            slug:filename.replace('.mdx',''),
        })
    })

    return {
        props:{works:works.sort((a,b)=>a.order - b.order)}
    }
}

const Index = ({works}:{works:IindexItem[]}) => {
    gsap.registerPlugin(ScrollTrigger)
    const 
        progressRef = useRef<HTMLDivElement>(),
        mobileCheckbox = useRef<HTMLInputElement>(),
        containerRef = useRef<HTMLDivElement>(),
        pathRef = useRef<SVGPathElement>(),
        toTop = () => {
            if (window.scrollY < window.innerHeight) return
            closeAllModals()
            mobileCheckbox.current.checked = false
            window.scrollTo(0,window.innerHeight)
            window.scrollTo({top:0,behavior:'smooth'})
        },
        toSlides = () => {
            const 
                container = document.getElementById('cinema-container'),
                {top,height} = container.getClientRects()[0],
                flockContainer = document.getElementById('flock-container')
            
            if (top < 0 && top > -height) return
            container.scrollIntoView()
            window.scrollBy({top:flockContainer.offsetHeight * 1.1,behavior:'smooth'})
            mobileCheckbox.current.checked = false
        },
        toDiamonds = () => {
            const 
                container = document.getElementById('diamonds-container'),
                {top,height} = container.getClientRects()[0]
            if (top < 0 && top > -height) return

            closeAllModals()
            mobileCheckbox.current.checked = false

            container.scrollIntoView()
            window.scrollBy({top:window.innerHeight * 2,behavior:'smooth'})
        },
        toContact = () => {
            const 
                container = document.getElementById('bottle-container'),
                {top} = container.getClientRects()[0]

            if (top < 0) return

            closeAllModals()
            mobileCheckbox.current.checked = false
            container.scrollIntoView()
            container.scrollIntoView({block:'end',behavior:'smooth'})
        },
        onResize = () => mobileCheckbox.current.checked = false,
        bgOnClick = (e:any) => {
            if (e.target.id==='mobile-menu-container') mobileCheckbox.current.checked = false
        },
        canvasLoadCount = useRef(0),
        totalCanvas = useRef(4).current,
        loaderCenter = useRef({x:75,y:75}).current,
        loaderRadius = useRef(50).current,
        loaderBackStart = useRef(0),
        loadBack = (e:number) => {
            if (!!loaderBackStart.current){
                const 
                    endAngle = 0.25,
                    backAngle = 360 - (e - loaderBackStart.current) * 0.2,
                    startAngle = endAngle - backAngle / 360,
                    x1 = loaderCenter.x + Math.cos(startAngle * 360 * Math.PI / 180) * loaderRadius,
                    y1 = loaderCenter.y - Math.sin(startAngle * 360 * Math.PI / 180) * loaderRadius,
                    x2 = loaderCenter.x + Math.cos(endAngle * 360 * Math.PI / 180) * loaderRadius,
                    y2 = loaderCenter.y - Math.sin(endAngle * 360 * Math.PI / 180) * loaderRadius

                pathRef.current.setAttribute('d',`M${x1},${y1} A${loaderRadius},${loaderRadius} 0 ${backAngle > 180 ? 1 : 0} 0 ${x2},${y2}`)

                if (backAngle > 0) window.requestAnimationFrame(loadBack)
                else {
                    pathRef.current.style.display = 'none'
                    containerRef.current.classList.add('loaded')
                }
            } else {
                loaderBackStart.current = e
                window.requestAnimationFrame(loadBack)
            }
        },
        loading = () => {
            const
                startAngle = 0.25,
                endAngle = Math.min(canvasLoadCount.current / totalCanvas + startAngle,1.24),
                x1 = loaderCenter.x + Math.cos(startAngle * 360 * Math.PI / 180) * loaderRadius,
                y1 = loaderCenter.y - Math.sin(startAngle * 360 * Math.PI / 180) * loaderRadius,
                x2 = loaderCenter.x + Math.cos(endAngle * 360 * Math.PI / 180) * loaderRadius,
                y2 = loaderCenter.y - Math.sin(endAngle * 360 * Math.PI / 180) * loaderRadius
            pathRef.current.setAttribute('d',`M${x1},${y1} A${loaderRadius},${loaderRadius} 0 ${(endAngle - startAngle) * totalCanvas > totalCanvas * 0.5 ? 1 : 0} 0 ${x2},${y2}`)

            if (canvasLoadCount.current === totalCanvas) window.requestAnimationFrame(loadBack)
        },
        canvasLoaded = () => {
            canvasLoadCount.current ++
            loading()
        }

    useEffect(()=>{
        window.addEventListener('resize',onResize)
        containerRef.current.addEventListener('canvasLoaded',canvasLoaded)

        progressRef.current.style.width = '0%'

        ScrollTrigger.create({
            trigger:'#home',
            start:'top 0%',
            end:'bottom 100%',
            onUpdate:({progress})=> progressRef.current.style.width = `${progress * 100}%`
        })

        return () => window.removeEventListener('resize',onResize)
    },[])

    return (
        <>
        <Head>
            <title>Cindy Ho - Full Stack Developer</title>
            <script type="application/ld+json" dangerouslySetInnerHTML={{__html:`{
                "@context": "https://schema.org",
                "@type" : "WebSite",
                "name": "Cindy Ho - Full Stack Developer",
                "description": "I am a self-taught full stack developer. Welcome to my portfolio, which is written with Next.js, Sass, Three.js and GSAP. Feel free to contact me and have a nice visit on my site.",
                "url": "https://cindyhodev.com/",
                "image":"portfolio.jpg",
                "creator":{
                    "@type": "Person",
                    "name": "Cindy Ho"
                }
            }`}}></script>
            <link rel="canonical" href="https://cindyhodev.com" />
            <meta charSet="utf-8"/>
            <meta name="robots" content="index,follow" />
            <meta httpEquiv="cache-control" content="private" />
            <meta httpEquiv="expires" content="43200"/>
            <meta name="description" content="I am a self-taught full stack developer. Welcome to my portfolio, which is written with Next.js, Sass, Three.js and GSAP. Feel free to contact me and have a nice visit on my site."></meta>
        </Head>
        <svg height='100' width='100' viewBox="0 0 150 150" style={{position:'fixed',top:'calc(50vh - 50px)',left:'calc(50vw - 50px)'}}>
            <filter id='shadow' colorInterpolationFilters="sRGB">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodOpacity="1" floodColor='white' />
                <feDropShadow dx="0" dy="0" stdDeviation="1" floodOpacity="1" floodColor='white' />
            </filter>
            <path 
                ref={pathRef} 
                stroke='#ffffff' 
                fill='none' 
                strokeWidth={3} 
                strokeLinecap='round' 
                style={{filter:'url(#shadow)'}} 
            />
        </svg>
        <div id='home' ref={containerRef}>
            <FlockOnSphere />
            <IndexContext.Provider value={{works}}>
                <Cinema />
            </IndexContext.Provider>
            <Diamonds />
            <Bottle />
            <FpsCounter />
            <div id='desktop-menu'>
                <div ref={progressRef} id='progress' />
                <div id='desktop-menu-btns'>
                    <button onClick={toTop}>Home</button>
                    <button onClick={toSlides}>Work</button>
                    <button onClick={toDiamonds}>About</button>
                    <button onClick={toContact}>Contact</button>
                </div>
            </div>
            <input type='checkbox' id='mobile-menu-checkbox' ref={mobileCheckbox} hidden />
            <div id='mobile-menu-container' onClick={bgOnClick}>
                <div id='mobile-menu'>
                    <button onClick={toTop}>Home</button>
                    <button onClick={toSlides}>Work</button>
                    <button onClick={toDiamonds}>About</button>
                    <button onClick={toContact}>Contact</button>
                </div>
            </div>
            <label htmlFor="mobile-menu-checkbox">
                {Array.from(Array(3).keys(),(i)=>(<div key={i} />))}
            </label>
        </div>
        </>
    )
}

export default Index