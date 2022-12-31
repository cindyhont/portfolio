import React from "react";
import ScrollParallaxContainer from "../scroll-parallax-container";
import Logos from "./logos";
import styles from './styles/AboutMe.module.scss'

const AboutMe = () => (
    <div id='about' className={`section ${styles['about-me-container']}`}>
        <ScrollParallaxContainer wavePaths={[
            "M0 190L25 205.8C50 221.7 100 253.3 150 259.3C200 265.3 250 245.7 300 232.2C350 218.7 400 211.3 450 215.2C500 219 550 234 600 237C650 240 700 231 750 227.2C800 223.3 850 224.7 875 225.3L900 226L900 116L875 127.3C850 138.7 800 161.3 750 170.3C700 179.3 650 174.7 600 164.2C550 153.7 500 137.3 450 130.7C400 124 350 127 300 145.7C250 164.3 200 198.7 150 201.7C100 204.7 50 176.3 25 162.2L0 148Z",
            "M0 289L25 299.5C50 310 100 331 150 330.3C200 329.7 250 307.3 300 303.7C350 300 400 315 450 324.7C500 334.3 550 338.7 600 334.2C650 329.7 700 316.3 750 308.2C800 300 850 297 875 295.5L900 294L900 224L875 223.3C850 222.7 800 221.3 750 225.2C700 229 650 238 600 235C550 232 500 217 450 213.2C400 209.3 350 216.7 300 230.2C250 243.7 200 263.3 150 257.3C100 251.3 50 219.7 25 203.8L0 188Z",
            "M0 451L25 451C50 451 100 451 150 451C200 451 250 451 300 451C350 451 400 451 450 451C500 451 550 451 600 451C650 451 700 451 750 451C800 451 850 451 875 451L900 451L900 292L875 293.5C850 295 800 298 750 306.2C700 314.3 650 327.7 600 332.2C550 336.7 500 332.3 450 322.7C400 313 350 298 300 301.7C250 305.3 200 327.7 150 328.3C100 329 50 308 25 297.5L0 287Z",
        ]}>
            <div className={styles['about-me-content']}>
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
                <h2>Skills</h2>
                <Logos />
            </div>
        </ScrollParallaxContainer>
    </div>
)

export default AboutMe