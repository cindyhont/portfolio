import React from "react";
import LinkButton from "../../common/link-button";
import SectionHeading from "../section-heading";
import SeparatorContainer from "../separator";
import Logos from "./logos";
import styles from './styles/AboutMe.module.scss'

const AboutMe = () => (
    <div id='about' className={`section ${styles['about-me-container']}`}>
        <SeparatorContainer wavePaths={[
            "m0 190 25 16c25 16 75 47 125 53s100-13 150-27c50-13 100-21 150-17s100 19 150 22 100-6 150-10 100-2 125-2l25 1V116l-25 11c-25 12-75 34-125 43s-100 5-150-6c-50-10-100-27-150-33-50-7-100-4-150 15-50 18-100 53-150 56S50 176 25 162L0 148Z",
            "m0 289 25 11c25 10 75 31 125 30 50 0 100-23 150-26 50-4 100 11 150 21 50 9 100 14 150 9 50-4 100-18 150-26s100-11 125-12l25-2v-70l-25-1c-25 0-75-2-125 2s-100 13-150 10-100-18-150-22-100 4-150 17c-50 14-100 33-150 27S50 220 25 204L0 188Z",
            "M0 451h900V292l-25 2c-25 1-75 4-125 12s-100 22-150 26c-50 5-100 0-150-9-50-10-100-25-150-21-50 3-100 26-150 26-50 1-100-20-125-30L0 287Z",
        ]}>
            <div className={styles['about-me-content']}>
                <SectionHeading text='ABOUT' />
                <LinkButton {...{
                    link:'https://github.com/cindyhont/',
                    title:'My Github',
                    className:styles['my-github']
                }} />
                <p>
                    I am a self-taught developer 
                    who used to work as a product manager and marketer for over 5 years 
                    in the fashion accessories sector - which means: 
                    I am experienced in both working with people and things, with result.
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
                <Logos />
            </div>
        </SeparatorContainer>
    </div>
)

export default AboutMe