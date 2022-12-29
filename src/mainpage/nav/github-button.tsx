import React from "react";

const GithubButton = ({className}:{className?:string}) => (
    <a {...(!!className && {className})} aria-label='Github' href='https://github.com/cindyhont/' target='_blank' rel='noopener noreferrer'>
        <svg viewBox="-2 -2 28 28" width='35' height='35' style={{margin:'2px'}}>
            <use href='#github' />
        </svg>
    </a>
)

export default GithubButton