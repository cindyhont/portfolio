let dark = false;
const 
    prevDark = localStorage.getItem('dark'),
    systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches,
    htmlTag = document.getElementsByTagName('html')[0]

htmlTag.style.setProperty('--vh', window.innerHeight/100 + 'px');
htmlTag.style.setProperty('--current-actual-height', window.innerHeight + 'px');
htmlTag.style.setProperty('--landscape-height', Math.min(window.innerHeight,window.innerWidth) + 'px');
htmlTag.style.setProperty('--portrait-height', Math.max(window.innerHeight,window.innerWidth) + 'px');

if (!!prevDark) {
    dark = prevDark === 'true'
    if (dark === systemDark) localStorage.removeItem('dark')
}
else dark = systemDark

if (dark) htmlTag.dataset.theme = 'dark'
else htmlTag.dataset.theme = 'light'
    
if (window.location.pathname === '/') {
    htmlTag.style.backgroundColor = dark ? '#333' : '#eee'
    htmlTag.style.transition = 'background-color 0.5s'
}