import React from 'react'
import DesktopNavBar from './desktop'
import MobileNav from './mobile'

const Navigation = () => (
    <>
    <svg id='nav-side-button-template' width='0' height='0'>
        <defs>
            <filter id='theme-button-shadow'>
                {/* inset light shadow */}
                <feOffset dx='1' dy='1' />
                <feGaussianBlur stdDeviation={0.5} result='offset-blur-light' />
                <feComposite operator='out' in='SourceGraphic' result='inverse-light' />
                <feFlood className='light' result='color-light' />
                <feComposite operator='in' in='color-light' in2='inverse-light' result='shadow-light' />
                <feComposite operator='over' in='shadow-light' in2='SourceGraphic' result='result-light' />

                {/* inset dark shadow */}
                <feOffset dx='-0.5' dy='-0.5' />
                <feGaussianBlur stdDeviation={0.5} result='offset-blur-dark' />
                <feComposite operator='out' in='SourceGraphic' result='inverse-dark' />
                <feFlood className='dark' result='color-dark' />
                <feComposite operator='in' in='color-dark' in2='inverse-dark' result='shadow-dark' />
                <feComposite operator='over' in='shadow-dark' in2='result-light' />

                {/* outer shadows */}
                <feDropShadow className='light' dx='-1' dy='-1' stdDeviation={1} />
                <feDropShadow className='dark' dx='0.5' dy='0.5' stdDeviation={1} />
            </filter>
            <filter id='theme-button-shadow-hover'>
                {/* inset light shadow */}
                <feOffset dx='1' dy='1' />
                <feGaussianBlur stdDeviation={0.5} result='offset-blur-light' />
                <feComposite operator='out' in='SourceGraphic' result='inverse-light' />
                <feFlood className='light' floodOpacity={1} result='color-light' />
                <feComposite operator='in' in='color-light' in2='inverse-light' result='shadow-light' />
                <feComposite operator='over' in='shadow-light' in2='SourceGraphic' result='result-light' />

                {/* inset dark shadow */}
                <feOffset dx='-0.5' dy='-0.5' />
                <feGaussianBlur stdDeviation={0.5} result='offset-blur-dark' />
                <feComposite operator='out' in='SourceGraphic' result='inverse-dark' />
                <feFlood className='dark' floodOpacity={1} result='color-dark' />
                <feComposite operator='in' in='color-dark' in2='inverse-dark' result='shadow-dark' />
                <feComposite operator='over' in='shadow-dark' in2='result-light' />

                {/* outer shadows */}
                <feDropShadow className='light' dx='-1' dy='-1' stdDeviation={1} />
                <feDropShadow className='dark' dx='0.5' dy='0.5' stdDeviation={1} />
            </filter>
            <path id='moon' className='no-anim' d="M11.01 3.05C6.51 3.54 3 7.36 3 12c0 4.97 4.03 9 9 9 4.63 0 8.45-3.5 8.95-8 .09-.79-.78-1.42-1.54-.95-.84.54-1.84.85-2.91.85-2.98 0-5.4-2.42-5.4-5.4 0-1.06.31-2.06.84-2.89.45-.67-.04-1.63-.93-1.56z" />
            <path id='sun' className='no-anim' d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
            <path id='github' d="M12 1.27a11 11 0 00-3.48 21.46c.55.09.73-.28.73-.55v-1.84c-3.03.64-3.67-1.46-3.67-1.46-.55-1.29-1.28-1.65-1.28-1.65-.92-.65.1-.65.1-.65 1.1 0 1.73 1.1 1.73 1.1.92 1.65 2.57 1.2 3.21.92a2 2 0 01.64-1.47c-2.47-.27-5.04-1.19-5.04-5.5 0-1.1.46-2.1 1.2-2.84a3.76 3.76 0 010-2.93s.91-.28 3.11 1.1c1.8-.49 3.7-.49 5.5 0 2.1-1.38 3.02-1.1 3.02-1.1a3.76 3.76 0 010 2.93c.83.74 1.2 1.74 1.2 2.94 0 4.21-2.57 5.13-5.04 5.4.45.37.82.92.82 2.02v3.03c0 .27.1.64.73.55A11 11 0 0012 1.27" />
        </defs>
    </svg>
    <DesktopNavBar />
    <MobileNav />
    </>
)

export default Navigation