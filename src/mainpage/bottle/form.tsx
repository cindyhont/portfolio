import React, { FormEvent, useRef, useState } from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/dist/ScrollTrigger';

const Form = () => {
    gsap.registerPlugin(ScrollTrigger);
    const 
        nameRef = useRef<HTMLInputElement>(),
        emailRef = useRef<HTMLInputElement>(),
        phoneRef = useRef<HTMLInputElement>(),
        messageRef = useRef<HTMLTextAreaElement>(),
        submitBtn = useRef<HTMLInputElement>(),
        [adminMsg,setAdminMsg] = useState(''),
        dismissMsg = () => setAdminMsg(''),
        restore = () => {
            submitBtn.current.value = 'Submit';
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
                return; // redirect to cloudflare block page (zero trust) when cloudflare page is set up
            }

            submitBtn.current.value = 'sending ...'
            submitBtn.current.disabled = true
            nameRef.current.disabled = true
            emailRef.current.disabled = true
            messageRef.current.disabled = true

            const resObj = {
                name:nameRef.current.value,
                email:emailRef.current.value,
                message:messageRef.current.value,
                accessKey:process.env.STATIC_FORMS,
                replyTo:'@',
                subject:'Contact us from - xxxxxxxx.com'
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
                restore();
                setAdminMsg('There was an error. Please try again later.')
            }
        }
        // onInvalidEmail = (e:FormEvent) => e.target?.setCustomValidity('Please enter a valid email address.')

    return (
        <form onSubmit={onSubmit}>
            <h1>Contact</h1>
            <input 
                className='input-text' 
                ref={nameRef} 
                type="text" 
                required={true} 
                minLength={2} 
                maxLength={128}
                placeholder='Your name'
                onInput={dismissMsg}
            />
            <input 
                className='input-text'
                ref={emailRef} 
                type="email" 
                required={true} 
                minLength={5} 
                maxLength={128} 
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                // onInvalid={onInvalidEmail}
                placeholder='Your email address'
                onInput={dismissMsg}
            />
            <input className='phone' ref={phoneRef} type="text" style={{display:'none'}} />
            <textarea 
                ref={messageRef} 
                required={true} 
                minLength={2} 
                maxLength={5000} 
                placeholder='Message' 
                rows={6} 
                onInput={dismissMsg}
            ></textarea>
            <input type="submit" value="Submit" id='form-submit' ref={submitBtn} />
            <p id='admin-msg'>{adminMsg}</p>
        </form>
    )
};

export default Form;