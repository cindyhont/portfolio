import React, { useEffect, useRef } from "react";
import Head from 'next/head';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/dist/ScrollTrigger';
import {ScrollToPlugin} from 'gsap/dist/ScrollToPlugin';
import matter from 'gray-matter'
import fs from 'fs'
import { join } from 'path'
import { GetStaticProps } from 'next'
import { IindexItem } from "../src/interfaces";
import { IndexContext } from "../src/context";
import Aurora from "../src/mainpage/aurora";
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
    gsap.registerPlugin(ScrollTrigger,ScrollToPlugin)
    const 
        auroraEnd = (works.length - 1) * 200 + 400,
        diamondSlideDuration = 300,
        diamondSlideBgTransition = 50,
        diamondEnd = 200 + diamondSlideBgTransition * 4 + diamondSlideDuration * 2,
        progressRef = useRef<HTMLDivElement>(),
        mobileCheckbox = useRef<HTMLInputElement>(),
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
                {top,height} = container.getClientRects()[0]
            if (top < 0 && top > -height) return
            container.scrollIntoView()
            window.scrollBy({top:window.innerHeight * 1.1,behavior:'smooth'})
            mobileCheckbox.current.checked = false
        },
        toDiamonds = () => {
            // if (window.scrollY > window.innerHeight * (auroraEnd / 100 + 1) && window.scrollY < window.innerHeight * (diamondEnd / 100 + 1) + window.innerHeight * (auroraEnd / 100 + 1)) return


            const 
                {innerHeight} = window,
                container = document.getElementById('diamonds-container'),
                {top,height} = container.getClientRects()[0]
            if (top < 0 && top > -height) return

            closeAllModals()
            mobileCheckbox.current.checked = false

            container.scrollIntoView()

            const 
                aboutMeRect = document.getElementById('about-me').getClientRects()[0],
                aboutMeHeight = aboutMeRect.height

            if (aboutMeHeight > innerHeight) window.scrollBy({top:innerHeight,behavior:'smooth'})
            else {
                const h = (innerHeight - aboutMeHeight) * 0.5
                window.scrollBy({top:innerHeight - h,behavior:'smooth'})
            }
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
        }

    useEffect(()=>{
        window.addEventListener('resize',onResize)

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
        </Head>
        <div id='home'>
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