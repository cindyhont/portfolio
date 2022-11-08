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
            gsap.to(window,{
                duration:2,
                scrollTo:{
                    y:'#home',
                    offsetY:0,
                    autoKill:true
                }
            });
        },
        toSlides = () => {
            if (window.scrollY > window.innerHeight && window.scrollY < window.innerHeight * (auroraEnd / 100 + 1)) return
            window.scrollTo(0,window.innerHeight)
            gsap.to(window,{
                duration:3,
                scrollTo:{
                    y:'#aurora-container',
                    offsetY:window.innerHeight * -2,
                    autoKill:true
                }
            });
            mobileCheckbox.current.checked = false
        },
        toDiamonds = () => {
            if (window.scrollY > window.innerHeight * (auroraEnd / 100 + 1) && window.scrollY < window.innerHeight * (diamondEnd / 100 + 1) + window.innerHeight * (auroraEnd / 100 + 1)) return
            closeAllModals()
            mobileCheckbox.current.checked = false
            window.scrollTo(0,window.innerHeight * (auroraEnd / 100 + 1))
            gsap.to(window,{
                duration:2,
                scrollTo:{
                    y:'#diamonds-container',
                    offsetY:window.innerHeight * -(100 + diamondSlideBgTransition + 10) / 100,
                    autoKill:true
                }
            });
        },
        toContact = () => {
            if (window.scrollY > document.body.offsetHeight - window.innerHeight * 3) return
            closeAllModals()
            mobileCheckbox.current.checked = false
            document.getElementById('bottle-container').scrollIntoView();
            gsap.to(window,{
                duration:3,
                scrollTo:{
                    y:'#bottle-container',
                    offsetY:window.innerHeight * -2,
                    autoKill:true
                }
            });
        },
        onResize = () => mobileCheckbox.current.checked = false,
        bgOnClick = (e:any) => {
            if (e.target.id==='mobile-menu-container') mobileCheckbox.current.checked = false
        }

    useEffect(()=>{
        const
            dFlock = 1 + 1,
            dAurora = (works.length - 1) * 2 + 4 + 2,
            dDiamond = 0.5 * 4 + 3 * 2 + 2,
            dContact = 1,
            g = 1 / (dFlock + dAurora + dDiamond + dContact + 4)
        ScrollTrigger.create({
            trigger:document.body,
            onUpdate:({progress})=>{
                progressRef.current.style.width = `${(progress - g) / (1 - g * 2) * 100}%`
            }
        })
        window.addEventListener('resize',onResize)
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
                <Aurora end={auroraEnd} />
            </IndexContext.Provider>
            <Diamonds end={diamondEnd} slideDuration={diamondSlideDuration} bgTransition={diamondSlideBgTransition} />
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