import React from "react";

const ThemeButton = ({className}:{className?:string}) => (
    <button className={`theme-button ${className || ''}`.trim()} aria-label='Theme'>
        <svg viewBox="-2 -2 28 28" width='35' height='35'>
            <use href='#sun' />
            <use href='#moon' />
        </svg>
    </button>
)
export default ThemeButton