import React, { useEffect, useRef } from "react";
import matter from 'gray-matter'
import fs from 'fs'
import { join } from 'path'
import { GetStaticProps } from 'next'
import { IindexItem } from "../src/interfaces";
import Opening from "../src/mainpage/opening";
import Works from "../src/mainpage/works";
import { IndexContext } from "../src/context";
import AboutMe from "../src/mainpage/about-me";
import ContactForm from "../src/mainpage/contact-form";
import Navigation from "../src/mainpage/nav";
import Head from "next/head";
import styles from '../styles/Home.module.scss'
import { delayInSecond } from "../src/common";

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
    const containerRef = useRef<HTMLDivElement>()

    useEffect(()=>{
        setTimeout(()=>containerRef.current.style.display = null,delayInSecond * 1000)
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
            <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div id='main-page' className={styles['main-page']} ref={containerRef} style={{display:'none'}}>
            <Navigation />
            <Opening />
            <IndexContext.Provider value={{works}}>
                <Works />
            </IndexContext.Provider>
            <AboutMe />
            <ContactForm />
        </div>
        </>
    )
}

export default Index