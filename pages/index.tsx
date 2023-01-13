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

const Index = ({works}:{works:IindexItem[]}) => (
    <>
    <style global jsx>{`
        :root{
            --mode-transition-time: 0.5s
        }

        html[data-theme='light']{
            --background-color:#eee;
            --text-color:#555;
            --text-color-pale:#777;
        
            --sun-display:block;
            --moon-display:none;
        
            --desktop-nav-shadow:#ddd;
            --desktop-nav-url:#777;
            --desktop-nav-url-hover:#222;
        
            --mobile-nav-button-bg:#e3e3e3;
            --mobile-nav-button-shadow-outer:2px 2px 2px #ccc, -2px -2px 2px #fff;
            --mobile-nav-button-shadow:var(--mobile-nav-button-shadow-outer),inset -1px -1px 1px #ccc, inset 2px 2px 2px #fff;
            --mobile-nav-button-shadow-active:var(--mobile-nav-button-shadow-outer),inset -4px -4px 4px #fff, inset 4px 4px 4px #ccc;
        
            --mobile-sidebar-text-color:#777;
            --mobile-sidebar-section-match-color:#555;
        
            --title-text-color:#fff;
            --title-shadow-light:rgba(255,255,255,0.5);
            --title-shadow-dark:rgba(0,0,0,0.5);
            --title-shadow-back-a:rgba(0,0,0,0.3);
            --title-shadow-back-b:rgba(0,0,0,0.2);
            --title-cursor-border-color:#ddd;
        
            --work-box-shadow-outer:10px 10px 20px 0 #ccc, -10px -10px 10px 0 #fff;
            --work-box-shadow-all:var(--work-box-shadow-outer),inset 10px 10px 20px 0 #ddd, inset -10px -10px 10px 0 #fff;
            --work-title-text-color:rgba(0,0,0,0.4);
            --work-title-shadow:0px 1px 1px var(--background-color), 0 0 0 var(--text-color-pale);
            --work-stack-text-color:rgba(0,0,0,0.8);
            --work-stack-bg-color:rgba(0,0,0,0.08);
        
            --button-shadow-light:#fff;
            --button-shadow-dark:rgba(195, 193, 198, 0.9);
            --button-text-color:#777;
            --button-underline-color:#777;
        
            --about-me-logo-stroke-color:#777;
            --about-me-logo-shadow-light:#fff;
            --about-me-logo-shadow-dark:#ccc;
        
            --contact-input-shadow-light:#fff;
            --contact-input-shadow-dark:rgba(195, 193, 198, 0.9);
            --contact-input-text-color:#777;
        
            --waves-shadow-color:#000;
        
            --section-heading-bg-color:rgba(255,255,255,0.2);
            --section-heading-text-shadow: 
                min(0.7vw,3px)
                min(0.7vw,3px)
                min(0.7vw,3px)
                rgba(0,0,0,0.2),
                max(-0.35vw,-1.5px)
                max(-0.35vw,-1.5px)
                max(0.35vw,1.5px)
                rgba(255,255,255,1);
        }
        
        html[data-theme='dark']{
            --background-color:#333;
            --text-color:#aaa;
            --text-color-pale:#777;
        
            --sun-display:none;
            --moon-display:block;
        
            --desktop-nav-shadow:#282828;
            --desktop-nav-url:#aaa;
            --desktop-nav-url-hover:#eee;
        
            --mobile-nav-button-bg:#444;
            --mobile-nav-button-shadow-outer:2px 2px 2px #282828, -2px -2px 2px #555;
            --mobile-nav-button-shadow:var(--mobile-nav-button-shadow-outer),inset -1px -1px 1px #222, inset 1px 1px 1px #555;
            --mobile-nav-button-shadow-active:var(--mobile-nav-button-shadow-outer),inset -2px -2px 2px #555, inset 2px 2px 2px #222;
        
            --mobile-sidebar-text-color:#999;
            --mobile-sidebar-section-match-color:#ccc;
        
            --title-text-color:#222;
            --title-shadow-light:rgba(255,255,255,0.3);
            --title-shadow-dark:rgba(0,0,0,0.7);
            --title-shadow-back-a:rgba(255,255,255,0.7);
            --title-shadow-back-b:rgba(255,255,255,0.5);
            --title-cursor-border-color:#777;
        
            --work-box-shadow-outer:10px 10px 20px 0 #222, -10px -10px 10px 0 #444;
            --work-box-shadow-all:var(--work-box-shadow-outer),inset 10px 10px 20px 0 #222, inset -10px -10px 10px 0 #444;
            --work-title-text-color:rgba(255,255,255,0.7);
            --work-title-shadow:1px 1px 1px #000;
            --work-stack-text-color:rgba(255,255,255,0.8);
            --work-stack-bg-color:rgba(255,255,255,0.1);
        
            --button-shadow-light:#444;
            --button-shadow-dark:rgba(0,0,0, 0.5);
            --button-text-color:#aaa;
            --button-underline-color:#aaa;
        
            --about-me-logo-stroke-color:#999;
            --about-me-logo-shadow-light:#444;
            --about-me-logo-shadow-dark:#222;
        
            --contact-input-shadow-light:#444;
            --contact-input-shadow-dark:#222;
            --contact-input-text-color:#ccc;
        
            --waves-shadow-color:#fff;
        
            --section-heading-bg-color:rgba(255,255,255,0.5);
            --section-heading-text-shadow: 
                min(0.7vw,3px)
                min(0.7vw,3px)
                min(0.7vw,3px)
                rgba(0,0,0,0.5),
                max(-0.35vw,-1.5px)
                max(-0.35vw,-1.5px)
                max(0.35vw,1.5px)
                rgba(255,255,255,0.3);
        }

        html, body {
            overflow-x: hidden;
        }

        html {
            transition: background-color var(--mode-transition-time);
        }

        body {
            background-color: var(--background-color);
            letter-spacing: 0.03rem;
            font-family: Helvetica, Arial, sans-serif;
            font-weight: 300;
            transition: background-color var(--mode-transition-time), color var(--mode-transition-time);
            color: var(--text-color);
            position: relative;
        }

        a {
            color: var(--text-color);
            font-weight: 400;
            text-decoration: none;
            transition: color var(--mode-transition-time);
        }

        a:hover {
            text-decoration: underline;
        }
    
        h1, h2{
            font-family: 'Arial Black', 'AvenirNext-Bold', 'Arial-BoldMT', 'Helvetica-Bold', sans-serif;
        }
    
        h3 {
            font-family: Georgia;
            font-weight: 900;
            font-size: min(2.5rem,11vw);
            margin: 1rem 0;
            color: var(--work-title-text-color);
            text-shadow: var(--work-title-shadow);
            transition: all var(--mode-transition-time);
        }
    `}</style>
    <Head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-KKHR264QYG"></script>
        <script dangerouslySetInnerHTML={{__html:`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-KKHR264QYG');
        `}}></script>
        <title>Cindy Ho - Full Stack Developer</title>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html:`{"@context":"https://schema.org","@type":"WebSite","name":"Cindy Ho - Full Stack Developer","description":"I am a self-taught full stack developer. Welcome to my portfolio, which is written with Next.js, Sass, Three.js and GSAP. Feel free to contact me and have a nice visit on my site.","url":"https://cindyhodev.com/","image":"portfolio.jpg","creator":{"@type":"Person","name":"Cindy Ho"}}`}}></script>
        <link rel="canonical" href="https://cindyhodev.com" />
        <meta charSet="utf-8"/>
        <meta name="robots" content="index,follow" />
        <meta httpEquiv="cache-control" content="private" />
        <meta httpEquiv="expires" content="43200"/>
        <meta name="description" content="I am a self-taught full stack developer. Welcome to my portfolio, which is written with Next.js, Sass, Three.js and GSAP. Feel free to contact me and have a nice visit on my site."></meta>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
    <div>
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

export default Index