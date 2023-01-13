import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { addLetterSpacing } from '../../common/functions';
import SectionHeading from '../section-heading';
import styles from './ContactForm.module.scss'
import { placeholders } from './placeholders';

const ContactForm = () => {
    const 
        nameRef = useRef<HTMLInputElement>(),
        emailRef = useRef<HTMLInputElement>(),
        phoneRef = useRef<HTMLInputElement>(),
        messageRef = useRef<HTMLTextAreaElement>(),
        submitBtn = useRef<HTMLButtonElement>(),
        submitBtnP = useRef<HTMLDivElement>(),
        clearSubmitBtnText = () => {
            while (submitBtnP.current.lastChild){
                submitBtnP.current.removeChild(submitBtnP.current.lastChild)
            }
        },
        replaceSubmitButtonText = (text:string) => {
            clearSubmitBtnText()
            addLetterSpacing(text,submitBtnP.current,styles['letter-space'])
        },
        [adminMsg,setAdminMsg] = useState(''),
        dismissMsg = () => setAdminMsg(''),
        restore = () => {
            replaceSubmitButtonText('Submit');
            submitBtn.current.disabled = false;
            nameRef.current.disabled = false;
            emailRef.current.disabled = false;
            messageRef.current.disabled = false;
        },
        clearForm = () => {
            nameRef.current.value = '';
            emailRef.current.value = '';
            messageRef.current.value = '';
        },
        onSubmit = async (e:FormEvent) => {
            e.preventDefault();
            
            if (!!phoneRef.current.value){
                window.location.replace('https://no-bot.pages.dev')
                return;
            }

            replaceSubmitButtonText('sending');
            submitBtn.current.disabled = true
            nameRef.current.disabled = true
            emailRef.current.disabled = true
            messageRef.current.disabled = true

            const resObj = {
                name:nameRef.current.value,
                email:emailRef.current.value,
                message:messageRef.current.value,
                accessKey:'be609245-f050-4f5a-bec4-7aaf43e4216b',
                replyTo:'@',
                subject:'Contact us from - cindyhodev.com'
            }

            try {
                const 
                    res = await fetch('https://api.staticforms.xyz/submit', {
                        method: 'POST',
                        body: JSON.stringify(resObj),
                        headers: { 'Content-Type': 'application/json' }
                    }),
                    json = await res.json()

                if (json.success) {
                    restore();
                    clearForm();
                    setAdminMsg('Thanks for your message. I will get back to you soon.')
                } else {
                    restore();
                    setAdminMsg('There was an error. Please try again later.')
                }
            } catch (error) {
                console.log('e:',error)
                restore();
                setAdminMsg('There was an error. Please try again later.')
            }
        }
        // onInvalidEmail = (e:FormEvent) => e.target?.setCustomValidity('Please enter a valid email address.')

    useEffect(()=>{
        replaceSubmitButtonText('Submit')
    },[])

    return (
        <div id='contact' className={`section ${styles.contact}`}>
            <div>
                <SectionHeading text='CONTACT' />
                <form onSubmit={onSubmit} className={styles.form}>
                    <input 
                        ref={nameRef} 
                        type="text" 
                        required={true} 
                        minLength={2} 
                        maxLength={128}
                        placeholder={placeholders.name}
                        onInput={dismissMsg}
                    />
                    <input 
                        ref={emailRef} 
                        type="email" 
                        required={true} 
                        minLength={5} 
                        maxLength={128} 
                        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                        // onInvalid={onInvalidEmail}
                        placeholder={placeholders.email}
                        onInput={dismissMsg}
                    />
                    <input 
                        className={styles.phone} 
                        ref={phoneRef} 
                        type="text" 
                        placeholder={placeholders.phone}
                    />
                    <textarea 
                        ref={messageRef} 
                        required={true} 
                        minLength={2} 
                        maxLength={5000} 
                        placeholder={placeholders.message}
                        rows={6} 
                        onInput={dismissMsg}
                    ></textarea>
                    <button type="submit" id='form-submit' aria-label='form-submit' ref={submitBtn} className={styles.button}>
                        <div ref={submitBtnP} />
                    </button>
                    <p className={styles['admin-msg']} aria-label='admin-msg'>{adminMsg}</p>
                </form>
            </div>
        </div>
    )
};

export default ContactForm;