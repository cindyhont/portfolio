import React from "react";

const Logo = ({title,children}:{title:string;children:JSX.Element;}) => (
    <div className="about-me-skill">
        <div className="about-me-skill-logo">
           {children}
        </div>
        <div className="about-me-skill-caption">{title}</div>
    </div>
)

export default Logo