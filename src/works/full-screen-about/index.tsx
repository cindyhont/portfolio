import React, { ChangeEvent, useRef } from "react";
import Image from "next/image";
import { cdnPrefix } from "../../common/functions";
import styles from './FullScreenAbout.module.scss'
import { useWindowEventListeners } from "../../hooks";

const FullScreenAbout = ({children}:{children:JSX.Element}) => {
    const 
        checkbox = useRef<HTMLInputElement>(),
        checkboxID = useRef('full-screen-about-checkbox').current,
        keyEscOnPress = (e:KeyboardEvent) => {
            if (['Esc','Escape'].includes(e.key) && checkbox.current.checked) checkbox.current.click()
        },
        onChange = (e:ChangeEvent<HTMLInputElement>) => {
            // hide gui if the modal is shown
            const
                displayValue = e.target.checked ? 'none' : 'flex',
                elements = document.getElementsByClassName('lil-gui') as HTMLCollectionOf<HTMLDivElement>,
                len = elements.length

            for (let i=0; i<len; i++){
                elements.item(i).style.display = displayValue
            }
        }

    useWindowEventListeners([
        {evt:'keyup',func:keyEscOnPress},
    ])

    return (
        <>
        <label htmlFor={checkboxID} id={`${checkboxID}-icon`} className={styles[`${checkboxID}-icon`]}>
            <Image src={cdnPrefix() + '/circle-question-regular.svg'} width={30} height={30} alt='About' />
        </label>
        <input type='checkbox' id={checkboxID} className={styles[checkboxID]} hidden ref={checkbox} onChange={onChange} />
        <div id='full-screen-about-container' className={styles['full-screen-about-container']}>
            <label htmlFor={checkboxID} id={`${checkboxID}-backdrop`} className={styles[`${checkboxID}-backdrop`]} />
            {children}
            <label htmlFor={checkboxID} id={`${checkboxID}-close`} className={styles[`${checkboxID}-close`]}>
                <svg width={35} height={35}>
                    <line stroke='#fff' strokeLinecap="round" strokeWidth={3} x1={0} y1={0} x2={35} y2={35} />
                    <line stroke='#fff' strokeLinecap="round" strokeWidth={3} x1={0} y1={35} x2={35} y2={0} />
                </svg>
            </label>
        </div>
        </>
    )
}

export default FullScreenAbout