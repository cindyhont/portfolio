import Contact from '../src/mainpage/contact-form'
import { render } from '@testing-library/react'
import { placeholders } from '../src/mainpage/contact-form/placeholders'
import user from '@testing-library/user-event'

describe('Contact form test',()=>{
    beforeEach(()=>{
        delete window.location;
        window.location = Object.assign(new URL("https://cindyhodev.com"))
    });

    it('Honeypot should direct bot to no bot page',async() => {
        const 
            contactForm = render(<Contact />),
            nameField = await contactForm.findByPlaceholderText(placeholders.name),
            emailField = await contactForm.findByPlaceholderText(placeholders.email),
            phoneField = await contactForm.findByPlaceholderText(placeholders.phone),
            messageField = await contactForm.findByPlaceholderText(placeholders.message),
            submitBtn = await contactForm.findByLabelText('form-submit')
        user.type(nameField,'test name')
        user.type(emailField,'test@cindyhodev.com')
        user.type(phoneField,'1234567890')
        user.type(messageField,'test message')
        user.click(submitBtn)

        setTimeout(()=>{
            expect(global.window.location).toBe('https://no-bot.pages.dev')
        },100)
    })

    it('Window location should not change when honeypot is empty',async() => {
        const 
            contactForm = render(<Contact />),
            nameField = await contactForm.findByPlaceholderText(placeholders.name),
            emailField = await contactForm.findByPlaceholderText(placeholders.email),
            messageField = await contactForm.findByPlaceholderText(placeholders.message),
            submitBtn = await contactForm.findByLabelText('form-submit')
        user.type(nameField,'test name')
        user.type(emailField,'test@cindyhodev.com')
        user.type(messageField,'test message')
        user.click(submitBtn)

        setTimeout(()=>{
            expect(global.window.location).toBe('https://cindyhodev.com')
        },3000)
    })

    it('Update after message is sent',async() => {
        const 
            contactForm = render(<Contact />),
            nameField = await contactForm.findByPlaceholderText(placeholders.name),
            emailField = await contactForm.findByPlaceholderText(placeholders.email),
            messageField = await contactForm.findByPlaceholderText(placeholders.message),
            adminMsgField = await contactForm.findByLabelText('admin-msg'),
            submitBtn = await contactForm.findByLabelText('form-submit')
        user.type(nameField,'test name')
        user.type(emailField,'test@cindyhodev.com')
        user.type(messageField,'test message')
        user.click(submitBtn)

        setTimeout(()=>{
            expect(adminMsgField.innerText).toBe('Thanks for your message. I will get back to you soon.')
        },3000)
    })
})

export {}