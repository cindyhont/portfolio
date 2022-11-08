import React, { ChangeEvent, useEffect, useRef } from "react";

const FullScreenAbout = ({children}:{children:JSX.Element}) => {
    const 
        checkbox = useRef<HTMLInputElement>(),
        checkboxID = useRef('full-screen-about-checkbox').current,
        keyEscOnPress = (e:KeyboardEvent) => {
            if (['Esc','Escape'].includes(e.key)) {
                e.preventDefault()
                checkbox.current.checked = false
            }
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

    useEffect(()=>{
        window.addEventListener('keyup',keyEscOnPress)
        return () => window.removeEventListener('keyup',keyEscOnPress)
    },[])

    return (
        <>
        <label htmlFor={checkboxID} id={`${checkboxID}-icon`}>
            <img src='/circle-question-regular.svg' width={30} height={30} />
        </label>
        <input type='checkbox' id={checkboxID} hidden ref={checkbox} onChange={onChange} />
        <div id='full-screen-about-container'>
            <label htmlFor={checkboxID} id={`${checkboxID}-backdrop`} />
            {children}
            <label htmlFor={checkboxID} id={`${checkboxID}-close`}>
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