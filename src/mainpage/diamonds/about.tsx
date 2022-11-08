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
    About = (
        {
            start,
            end,
            slideDuration,
            bgTransition
        }:{
            start:number;
            end:number;
            slideDuration:number;
            bgTransition:number;
        }
    ) => {
        gsap.registerPlugin(ScrollTrigger);

        const 
            [aboutMeStatus,setAboutMeStatus] = useState(0),
            [aboutSiteStatus,setAboutSiteStatus] = useState(0),

            aboutMeRef = useRef<HTMLDivElement>(),
            aboutMeLinesRef = useRef<HTMLDivElement>(),
            aboutSiteRef = useRef<HTMLDivElement>(),
            animateContent = (state:number,classname:string) => {
                if (state === 1) {
                    gsap.fromTo(classname,{
                        autoAlpha:null,
                        x:'+0.3%',
                    },{
                        autoAlpha:1,
                        x:'0',
                        stagger:0.05,
                        duration:0.3
                    });
                } else if (state === 0) {
                    gsap.fromTo(classname,{
                        autoAlpha:1,
                        x:'0',
                    },{
                        autoAlpha:null,
                        x:'+0.3%',
                        stagger:{
                            each:0.05,
                            from:'end'
                        },
                        duration:0.3
                    });
                } else if (state === 2){
                    gsap.fromTo(classname,{
                        autoAlpha:1,
                        x:'0',
                    },{
                        autoAlpha:null,
                        x:'-0.3%',
                        stagger:0.05,
                        duration:0.3
                    });
                } else if (state === 3){
                    gsap.fromTo(classname,{
                        autoAlpha:null,
                        x:'-0.3%',
                    },{
                        autoAlpha:1,
                        x:'0',
                        stagger:{
                            each:0.05,
                            from:'end'
                        },
                        duration:0.3
                    });
                }
            },
            updateAboutMe = () => {
                if (aboutMeLinesRef.current.hasChildNodes()){
                    while (aboutMeLinesRef.current.lastChild){
                        aboutMeLinesRef.current.removeChild(aboutMeLinesRef.current.lastChild)
                    }
                }

                let width = window.innerWidth
                if (width > 699) width *= 0.4
                else if (width > 499) width *= 0.6
                else width *= 0.68
                width = Math.floor(width)

                const 
                    canvas = document.createElement('canvas'),
                    ctx = canvas.getContext('2d'),
                    fontFamily = window.getComputedStyle(document.body).fontFamily,
                    paragraphs = [
                        `
                            I am a self-taught developer, 
                            born and raised in Hong Kong, 
                            used to work as a product manager and marketer for over 5 years 
                            in the fashion accessories sector - which means: 
                            I value both functionality and commercial value.
                        `,
                        `
                            I am a fast and aggressive learner. 
                            I learn new things whenever I have problems to solve but cannot find a solution. 
                            While I was working on this portfolio, 
                            it happened more than once that none of the packages/plugins available could meet my needs. 
                            I ended up writing my own version.
                        `,
                    ],
                    pLen = paragraphs.length

                canvas.width = Math.floor(width)
                canvas.height = 1000
                ctx.font = `1.1rem ${fontFamily}`

                for (let i=0; i<pLen; i++){
                    let line = ''

                    const 
                        paragraph = document.createElement('p'),
                        text = paragraphs[i].split('\n').map(e=>e.trim()).join(' ').trim(),
                        words = text.split(' '),
                        wLen = words.length,
                        appendNewLine = () => {
                            const span = document.createElement('span')
                            span.classList.add('about-me-lines')
                            span.innerText = line
                            paragraph.appendChild(span)
                        }

                    for (let j=0; j<wLen; j++){
                        const 
                            tempLine = !!line ? `${line} ${words[j]}` : words[j],
                            lineWidth = ctx.measureText(tempLine).width
                        if (lineWidth < width) line = tempLine
                        else {
                            appendNewLine()
                            line = words[j]
                        }
                        if (j === wLen - 1) appendNewLine()
                    }
                    aboutMeLinesRef.current.appendChild(paragraph)
                }
                animateContent(aboutMeStatus,'.about-me-lines')
            }
            

        useEffect(()=>{
            updateAboutMe()
            window.addEventListener('resize',updateAboutMe)
            return () => window.removeEventListener('resize',updateAboutMe)
        },[aboutMeStatus])
            
        useEffect(()=>{
            gsap.timeline({
                scrollTrigger:{
                    trigger:'#diamonds-container',
                    start:`top -${start}%`,
                    end:`top -${start + bgTransition}%`,
                    scrub:true,
                    onLeave:()=>setAboutMeStatus(1),
                    onEnterBack:()=>setAboutMeStatus(0),
                }
            })
            .from(aboutMeRef.current,{
                autoAlpha:0,
            })
            .to(aboutMeRef.current,{
                autoAlpha:1,
            })

            gsap.timeline({
                scrollTrigger:{
                    trigger:'#diamonds-container',
                    start:`top -${start + bgTransition + slideDuration}%`,
                    end:`top -${start + slideDuration + bgTransition * 2}%`,
                    scrub:true,
                    onEnter:()=>setAboutMeStatus(2),
                    onLeaveBack:()=>setAboutMeStatus(3),
                }
            })
            .to(aboutMeRef.current,{
                autoAlpha:0,
            })
            
            gsap.timeline({
                scrollTrigger:{
                    trigger:'#diamonds-container',
                    start:`top -${start + slideDuration + bgTransition * 2}%`,
                    end:`top -${start + slideDuration + bgTransition * 3}%`,
                    scrub:true,
                    onEnterBack:()=>setAboutSiteStatus(0),
                    onLeave:()=>setAboutSiteStatus(1),
                }
            })
            .from(aboutSiteRef.current,{
                autoAlpha:0,
            })
            .to(aboutSiteRef.current,{
                autoAlpha:1,
            })

            gsap.timeline({
                scrollTrigger:{
                    trigger:'#diamonds-container',
                    start:`top -${start + slideDuration * 2 + bgTransition * 3}%`,
                    end:`top -${end}%`,
                    scrub:true,
                    onLeaveBack:()=>setAboutSiteStatus(3),
                    onEnter:()=>setAboutSiteStatus(2),
                }
            })
            .to(aboutSiteRef.current,{
                autoAlpha:0,
                duration:1
            })
        },[])

        useEffect(()=>{
            animateContent(aboutSiteStatus,'.about-site-lines');
        },[aboutSiteStatus])

        return (
            <>
            <div id='about-me' ref={aboutMeRef}>
                <h1 className="about-me-lines">ABOUT ME</h1>
                <div ref={aboutMeLinesRef} />
                <h2 className="about-me-lines">Skills</h2>
                <div style={{display: 'flex',flexWrap:'wrap'}}>
                    {skills.map((skill,i)=>(
                        <div className='skill about-me-lines' key={i}>{skill}</div>
                    ))}
                </div>
            </div>
            <div ref={aboutSiteRef} id='about-site'>
                <h1 className="about-site-lines">ABOUT THIS SITE</h1>
                <a className="about-site-lines" href='https://xxxxxxxxxxx.com' target='_blank' rel='noopener noreferrer'>
                    Check the source code
                </a>
                <p className="about-site-lines">This website was built with...</p>
                <div style={{display: 'flex',flexWrap:'wrap'}}>
                    {techs.map((tech,i)=>(
                        <div className="about-site-lines" key={i} style={{display: 'flex',flexDirection: 'column',width:'60px',marginRight:'15px',marginBottom:'25px'}}>
                            <img src={`/${tech.replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g,'').toLowerCase()}.svg`} />
                            <div style={{textAlign:'center',marginTop:'5px',fontSize:'13px'}}>{tech}</div>
                        </div>
                    ))}
                </div>
            </div>
            </>
        )
    }

export default About;