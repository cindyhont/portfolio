import React, { useEffect, useRef, useState } from "react";
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/dist/ScrollTrigger';
import Image from 'next/image'

const
    skills = [
        'TypeScript',
        'React',
        'Sass',
        'Three.js',
        'PostgreSQL',
        'Python',
        'Git',
    ],
    techs = [
        'Next.js',
        'Sass',
        'Three.js',
        'OpenGL',
        'TypeScript',
        'GSAP',
    ],
    About = () => {
        gsap.registerPlugin(ScrollTrigger);

        const 
            aboutMeRef = useRef<HTMLDivElement>()
            // aboutSiteRef = useRef<HTMLDivElement>()

        useEffect(()=>{
            const 
                allAboutMeSections = gsap.utils.toArray('.about-me-sections')
                // allAboutSiteSections = gsap.utils.toArray('.about-site-sections')

            ScrollTrigger.create({
                trigger:aboutMeRef.current,
                start:'top 80%',
                end:'bottom 20%',
                scrub:true,
                onEnter:()=>{
                    aboutMeRef.current.classList.add('bg-visible')
                    allAboutMeSections.forEach(e=>{
                        const elem = e as HTMLElement
                        elem.classList.add('neutral')
                    })
                },
                onLeave:()=>{
                    aboutMeRef.current.classList.remove('bg-visible')
                    allAboutMeSections.forEach(e=>{
                        const elem = e as HTMLElement
                        elem.classList.add('left')
                    })
                },
                onEnterBack:()=>{
                    aboutMeRef.current.classList.add('bg-visible')
                    allAboutMeSections.forEach(e=>{
                        const elem = e as HTMLElement
                        elem.classList.remove('left')
                    })
                },
                onLeaveBack:()=>{
                    aboutMeRef.current.classList.remove('bg-visible')
                    allAboutMeSections.forEach(e=>{
                        const elem = e as HTMLElement
                        elem.classList.remove('neutral')
                    })
                }
            })

            // ScrollTrigger.create({
            //     trigger:aboutSiteRef.current,
            //     start:'top 80%',
            //     end:'bottom 20%',
            //     scrub:true,
            //     onEnter:()=>{
            //         aboutSiteRef.current.classList.add('bg-visible')
            //         allAboutSiteSections.forEach(e=>{
            //             const elem = e as HTMLElement
            //             elem.classList.add('neutral')
            //         })
            //     },
            //     onLeave:()=>{
            //         aboutSiteRef.current.classList.remove('bg-visible')
            //         allAboutSiteSections.forEach(e=>{
            //             const elem = e as HTMLElement
            //             elem.classList.add('left')
            //         })
            //     },
            //     onEnterBack:()=>{
            //         aboutSiteRef.current.classList.add('bg-visible')
            //         allAboutSiteSections.forEach(e=>{
            //             const elem = e as HTMLElement
            //             elem.classList.remove('left')
            //         })
            //     },
            //     onLeaveBack:()=>{
            //         aboutSiteRef.current.classList.remove('bg-visible')
            //         allAboutSiteSections.forEach(e=>{
            //             const elem = e as HTMLElement
            //             elem.classList.remove('neutral')
            //         })
            //     }
            // })
        },[])

        return (
            <>
            <div style={{height:'100vh',width:'100vw'}} />
            <div id='about-me' ref={aboutMeRef}>
                <h1 className="about-me-sections title">ABOUT ME</h1>
                <p className="about-me-sections content">
                    I am a self-taught developer, 
                    born and raised in Hong Kong, 
                    used to work as a product manager and marketer for over 5 years 
                    in the fashion accessories sector - which means: 
                    I value both functionality and commercial value.
                </p>
                <p className="about-me-sections content">
                    I am a fast and aggressive learner. 
                    I learn new things whenever I have problems to solve but cannot find a solution. 
                    While I was working on this portfolio, 
                    it happened more than once that none of the packages/plugins available could meet my needs. 
                    I ended up writing my own version.
                </p>
                <h2 className="about-me-sections title">Skills</h2>
                <div style={{display: 'flex',flexWrap:'wrap'}} className='about-me-sections content'>
                    {skills.map((skill,i)=>(
                        <div className='skill' key={i}>{skill}</div>
                    ))}
                </div>
            </div>
            {/*<div style={{height:'100vh',width:'100vw'}} />
            <div 
                ref={aboutSiteRef}
                id='about-site'
            >
                <h1 className="about-site-sections title">ABOUT THIS SITE</h1>
                <a className="about-site-sections content" href='https://xxxxxxxxxxx.com' target='_blank' rel='noopener noreferrer'>
                    Check the source code
                </a>
                <p className="about-site-sections content">This website was built with...</p>
                <div style={{display: 'flex',flexWrap:'wrap'}} className="about-site-sections content">
                    {techs.map((tech,i)=>(
                        <div key={i} style={{display: 'flex',flexDirection: 'column',width:'60px',marginRight:'15px',marginBottom:'25px'}}>
                            <img src={`/${tech.replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g,'').toLowerCase()}.svg`} />
                            <div style={{textAlign:'center',marginTop:'5px',fontSize:'13px'}}>{tech}</div>
                        </div>
                    ))}
                </div>
            </div>*/}
            <div style={{height:'100vh',width:'100vw'}} />
            </>
        )
    }

export default About;