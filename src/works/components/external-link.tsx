import React from 'react'

const ExternalLink = (
    {
        href,
        children
    }:{
        href:string;
        children:JSX.Element;
    }
) => {
    return (
        <a href={href} target='_blank' rel='noopener noreferrer'>{children}</a>
    )
}

export default ExternalLink;