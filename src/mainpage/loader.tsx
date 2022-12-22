import React, { useEffect, useRef } from 'react'

const Loader = () => {
    const
        pathRef = useRef<SVGPathElement>(),
        loaderRef = useRef<HTMLDivElement>(),
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
                    loaderRef.current.style.display = 'none'
                    document.getElementById('home').classList.add('loaded')
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
        const homeContainer = document.getElementById('home')
        homeContainer.addEventListener('canvasLoaded',canvasLoaded)
    },[])

    return (
        <div id='loader' ref={loaderRef}>
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
        </div>
    )
}

export default Loader