import React from "react";
import Logos from "./logos";

const AboutMe = () => (
    <div id='about' className="section">
        <h2>ABOUT ME</h2>
        <p>
            I am a self-taught developer 
            who used to work as a product manager and marketer for over 5 years 
            in the fashion accessories sector - which means: 
            I value both functionality and commercial value.
        </p>
        <p>
            I am a fast and aggressive learner. 
            I learn new things whenever I have problems to solve but cannot find a solution. 
            While I was working on this portfolio, 
            it happened more than once that none of the packages/plugins available could meet my needs. 
            I ended up writing my own version.
        </p>
        <p>
            I am open to new opportunities in the UK and remote.
        </p>
        <h2 className="about-me-sections title">Skills</h2>
        <Logos />
    </div>
)

export default AboutMe