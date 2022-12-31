import React, { ForwardedRef, forwardRef } from "react";
import styles from './Waves.module.scss'

const Waves = forwardRef(({paths}:{paths:string[]},ref:ForwardedRef<SVGSVGElement>) => (
    <svg ref={ref} viewBox="0 0 900 450" className={styles.waves}>
        <filter id='wave-shadow' filterUnits='userSpaceOnUse'>
            <feDropShadow className={styles.shadow} stdDeviation={30} />
        </filter>
        {paths.map((d,i)=> <path key={i} d={d} />)}
    </svg>
))

Waves.displayName = 'Waves'
export default Waves