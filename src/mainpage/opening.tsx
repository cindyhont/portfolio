import React, { useEffect, useRef } from "react";

const Opening = () => {
    const
        titleRef = useRef<HTMLParagraphElement>(),
        nameRef = useRef<HTMLHeadingElement>(),
        addTitle = () => {
            const 
                title = 'Full Stack Developer',
                chars = title.split(''),
                len = chars.length,
                spaceCount = chars.filter(e=>e===' ').length

            let spaceIdx = 0

            for (let i=0; i<len; i++){
                if (chars[i]===' ') spaceIdx++
                const 
                    hideSpace = spaceIdx===spaceCount && chars[i]===' ',
                    span = document.createElement('span')
                span.innerText = chars[i]
                span.style.animationDelay = `${1.5 + i * 0.15}s`
                if (hideSpace) span.classList.add('space')
                titleRef.current.appendChild(span)
                const hr = document.createElement('hr')
                hr.style.animationDelay = `${1.5 + i * 0.15}s`
                if (hideSpace) hr.classList.add('space')
                titleRef.current.appendChild(hr);
            }
        },
        onScroll = () => (titleRef.current.lastElementChild as HTMLHRElement).style.animation = 'none'

    useEffect(()=>{
        addTitle()
        setTimeout(()=>nameRef.current.style.animation = 'none',1500)
        window.addEventListener('scroll',onScroll)
        return () => window.removeEventListener('scroll',onScroll)
    },[])

    return (
        <div id='home' className="section">
            <h1 ref={nameRef}>Cindy Ho</h1>
            <p ref={titleRef} />
        </div>
    )
}

export default Opening