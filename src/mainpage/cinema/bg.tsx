import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Context, IndexContext } from "../../context";
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/dist/ScrollTrigger';
import { canvasIsLoaded } from "../../common";

const 
    Scene = ({frontNoise,desertNoise,tSize}:{frontNoise:Uint8Array;desertNoise:Uint8Array;tSize:number;}) => {
        gsap.registerPlugin(ScrollTrigger)
        const
            {works} = useContext(IndexContext),
            {mobile} = useContext(Context),
            camera = useThree(state=>state.camera),
            invalidate = useThree(state=>state.invalidate),
            cloudMap = useMemo(()=>new THREE.TextureLoader().load('/fog.jpg'),[]),
            starCount = useRef(1200).current,
            randomNoise = useMemo(()=>{
                const 
                    arr = new Float32Array(Array.from(Array(4 * starCount * starCount),()=>Math.random())),
                    t = new THREE.DataTexture(arr,starCount,starCount,THREE.RGBAFormat,THREE.FloatType)
                t.needsUpdate = true
                return t
            },[]),
            slideSize = useThree(state=>{
                const 
                    {size} = state,
                    fov = (state.camera as THREE.PerspectiveCamera).fov,
                    fovInRad = fov * 0.5 * Math.PI / 180,
                    height = Math.tan(fovInRad) * 5 * 2
                
                return new THREE.Vector2(
                    Math.min(size.width *0.8,400),
                    Math.min(size.height * 0.8,400)
                ).multiplyScalar(height / size.height)
            }),
            textureLoader = useRef(new THREE.TextureLoader()).current,
            textureSpecs = useRef<{
                texture:THREE.Texture;
                offset:THREE.Vector2;
                repeat:THREE.Vector2;
            }[]>([]),
            blankTextureSpecs = useRef(Array(2).fill({
                texture:new THREE.Texture(),
                offset:new THREE.Vector2(),
                repeat:new THREE.Vector2(),
            })).current,
            getTextureSpecs = async () => {
                const 
                    meshRatio = slideSize.x / slideSize.y,
                    getSpec = (e:string) => new Promise<{
                        texture:THREE.Texture;
                        offset:THREE.Vector2;
                        repeat:THREE.Vector2;
                    }>(resolve=>{
                        textureLoader.load(e,texture=>{
                            const 
                                imageRatio = texture.image.width / texture.image.height,
                                offset = new THREE.Vector2(),
                                repeat = new THREE.Vector2()

                            if (imageRatio > meshRatio){
                                offset.set((1 - meshRatio / imageRatio) / 2, 0)
                                repeat.set(meshRatio / imageRatio, 1)
                            } else if (imageRatio < meshRatio){
                                offset.set(0, (1 - imageRatio / meshRatio) / 2)
                                repeat.set(1, imageRatio / meshRatio)
                            } else {
                                offset.set(0, 0)
                                repeat.set(1, 1)
                            }

                            resolve({texture,repeat,offset})
                        })
                    })
                textureSpecs.current = await Promise.all(works.map(e=>getSpec(`/${e.img}`)))
            },
            screenGeometry = new THREE.PlaneGeometry(slideSize.x,slideSize.y),
            screenMaterial = new THREE.RawShaderMaterial({
                uniforms:{
                    textureSets:{value:blankTextureSpecs},
                    noShow:{value:true},
                    turningOnOff:{value:false},
                    transitioning:{value:false},
                    transitionProgress:{value:0},
                    randomNoise:{value:randomNoise},
                },
                vertexShader:`
                    precision mediump float;
                    uniform mat4 modelViewMatrix, projectionMatrix;
                    attribute vec3 position;
                    attribute vec2 uv;
                    varying vec2 vUv;

                    void main(){
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
                        vUv = uv;
                    }
                `,
                fragmentShader:`
                    precision lowp float;

                    struct TextureSet {
                        sampler2D texture;
                        vec2 offset, repeat;
                    };
            
                    uniform TextureSet textureSets[2];
                    uniform bool noShow, turningOnOff, transitioning;
                    uniform float transitionProgress;
                    uniform sampler2D randomNoise;
                    varying vec2 vUv;

                    const float glitchRowA = 160.;
                    const float glitchRowB = 150.;

                    void main(){
                        if (noShow) gl_FragColor = vec4(0.);
                        else if (turningOnOff) {
                            vec2 onOffUv = abs(vUv - 0.5);
                            if (transitionProgress < 0.5) {
                                if (onOffUv.x > transitionProgress || onOffUv.y > 0.002) gl_FragColor = vec4(0.);
                                else gl_FragColor = vec4(1.);
                            } else {
                                if (onOffUv.y > transitionProgress - 0.5) gl_FragColor = vec4(0.);
                                else {
                                    onOffUv = vec2(vUv.x, vUv.y > 0.5 ? (vUv.y - 0.5) / (transitionProgress * 2. - 1.) + 0.5 : (transitionProgress - 0.5 - abs(vUv.y - 0.5))  / (transitionProgress * 2. - 1.));
                                    vec2 uv = onOffUv * textureSets[0].repeat + textureSets[0].offset;
                                    gl_FragColor = mix(vec4(1.),texture2D( textureSets[0].texture, uv),transitionProgress * 2. - 1.);
                                }
                            }
                        } else if (transitioning) {
                            float strength = smoothstep(0.,1.,1. - pow(abs(0.5 - transitionProgress) * 2.,100.)) * 0.2;
                            
                            float rowIDa = floor(vUv.y * glitchRowA) / glitchRowA;
                            vec4 freqA = texture2D(randomNoise,vec2(fract(0.3 + transitionProgress),rowIDa));

                            vec2 uvA = vUv * textureSets[0].repeat + textureSets[0].offset;
                            float rA = texture2D(textureSets[0].texture,uvA + vec2(freqA.x - 0.5,0.) * strength).r;
                            float gA = texture2D(textureSets[0].texture,uvA + vec2(freqA.y - 0.5,0.) * strength).g;
                            float bA = texture2D(textureSets[0].texture,uvA + vec2(freqA.z - 0.5,0.) * strength).b;
                            
                            float rowIDb = floor(vUv.y * glitchRowB) / glitchRowB;
                            vec4 freqB = texture2D(randomNoise,vec2(fract(0.5 - transitionProgress),1.-rowIDb));

                            vec2 uvB = vUv * textureSets[1].repeat + textureSets[1].offset;
                            float rB = texture2D(textureSets[1].texture,uvB + vec2(0.5 - freqB.w,0.) * strength).r;
                            float gB = texture2D(textureSets[1].texture,uvB + vec2(0.5 - freqB.z,0.) * strength).g;
                            float bB = texture2D(textureSets[1].texture,uvB + vec2(0.5 - freqB.x,0.) * strength).b;
            
                            gl_FragColor = vec4(mix(vec3(rA,gA,bA),vec3(rB,gB,bB),transitionProgress),1.);
                        } else {
                            vec2 uv = vUv * textureSets[0].repeat + textureSets[0].offset;
                            gl_FragColor = texture2D( textureSets[0].texture, uv);
                        }
                    }
                `,
                transparent:true
            }),
            desertColor = useRef(0xe4a862).current,
            skyGeometry = useRef(new THREE.PlaneGeometry(1,1).translate(0,0.5,-1000)).current,
            skyMaterial = new THREE.RawShaderMaterial({
                defines:{
                    TRANSLATEY:(slideSize.y * -10).toFixed(3),
                    STARCOUNT:starCount.toFixed(1),
                },
                uniforms:{
                    cloudMap:{value:cloudMap},
                    starNoise:{value:randomNoise},
                    uTime:{value:0},
                },
                vertexShader:`
                    precision mediump float;
                    uniform mat4 modelViewMatrix, projectionMatrix;
                    attribute vec3 position;
                    attribute vec2 uv;
                    varying float vY;
                    varying vec2 vUv;

                    void main(){
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position * vec3(10000.,10000.,1) + vec3(0.,TRANSLATEY,0.),1.);
                        vY = position.y;
                        vUv = uv;
                    }
                `,
                fragmentShader:`
                    precision lowp float;
                    uniform sampler2D cloudMap, starNoise;
                    uniform float uTime;
                    varying float vY;
                    varying vec2 vUv;

                    #define GA 0.08
                    #define GB 0.06
                    #define GC 0.03
                    #define GD 0.015
                    #define GE 0.01

                    void main(){
                        vec2 stillCloudUV = fract(vUv * 4.);
                        float stillCloud = texture2D(cloudMap,stillCloudUV).r * 0.1;

                        vec3 color = mix(vec3(0.317647058823529,0.,0.223529411764706),vec3(0.),smoothstep(0.,1.,min(vY,GA) / GA));
                        color = mix(vec3(0.23921568627451,0.109803921568627,0.317647058823529),color,smoothstep(0.,1.,min(vY,GB) / GB));
                        color = mix(vec3(0.533333333333333,0.282352941176471,0.705882352941176),color,smoothstep(0.,1.,min(vY,GC) / GC));
                        color = mix(vec3(0.494117647058824,0.223529411764706,0.486274509803922),color,smoothstep(0.,1.,min(vY,GD) / GD));
                        color = mix(vec3(0.843137254901961,0.474509803921569,0.545098039215686),color,smoothstep(0.,1.,min(vY,GE) / GE));
                        color = mix(color,vec3(1.),stillCloud);

                        vec2 movingCloudUvA = fract(vUv * 4. + vec2(uTime * 0.05,0.5));
                        float movingCloudA = texture2D(cloudMap,movingCloudUvA).g * 0.08;
                        color = mix(color,vec3(1.),movingCloudA);

                        vec2 movingCloudUvB = fract(vUv * 4. + vec2(uTime * 0.1,0.8));
                        float movingCloudB = texture2D(cloudMap,movingCloudUvB).b * 0.03;
                        color = mix(color,vec3(1.),movingCloudB);

                        vec4 starNoise = texture2D(starNoise,vUv);
                        if (starNoise.x > starNoise.z && starNoise.y > starNoise.z && 1. - starNoise.x > starNoise.z && 1. - starNoise.y > starNoise.z){
                            vec2 starUV = fract(vUv * STARCOUNT);
                            float d = 0.8 - distance(starUV,starNoise.xy) / starNoise.z;
                            float starOpacity = cos(starNoise.w * 10. + uTime * 4. * starNoise.z * starNoise.x / starNoise.y);
                            gl_FragColor = vec4(mix(color,vec3(1.),clamp((1. - starOpacity) * d - starNoise.w * 0.5,0.,1.)),1.);
                        } else {
                            gl_FragColor = vec4(color,1.);
                        }
                    }
                `,
            }),
            backDesertGeometry = useMemo(()=>{
                const 
                    geometry = new THREE.PlaneGeometry(100,100,tSize-1,tSize-1).rotateX(Math.PI * -0.5),
                    positionArr = new Float32Array(Array.from(geometry.attributes.position.array)),
                    count = geometry.attributes.position.count

                for (let i=0; i<count; i++){
                    const j = i * 3 + 1
                    positionArr[j] = desertNoise[i * 4] * 6
                }

                geometry.setAttribute('position',new THREE.BufferAttribute(positionArr,3,false))
                geometry.rotateY(Math.PI)
                geometry.translate(0,slideSize.y * -0.5 - 1,-55)
                geometry.computeVertexNormals()

                return geometry
            },[slideSize.y,desertNoise]),
            backDesertMaterial = new THREE.RawShaderMaterial({
                uniforms:{
                    uDesertColor:{value:new THREE.Color(desertColor)},
                    uCameraPos:{value:new THREE.Vector3()},
                    uCloudMap:{value:cloudMap},
                    uTime:{value:0},
                },
                vertexShader:`
                    precision mediump float;
                    uniform mat4 modelViewMatrix, projectionMatrix;
                    attribute vec3 position, normal;
                    attribute vec2 uv;
                    varying vec3 vPosition, vNormal;
                    varying vec2 vUv;

                    void main(){
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
                        vPosition = position;
                        vNormal = normal;
                        vUv = uv;
                    }
                `,
                fragmentShader:`
                    precision lowp float;
                    uniform vec3 uDesertColor, uCameraPos;
                    uniform sampler2D uCloudMap;
                    uniform float uTime;
                    varying vec3 vPosition, vNormal;
                    varying vec2 vUv;

                    #define LIGHT_SPREAD 10.

                    const vec3 lightPos = vec3(0.,100000.,-10000.);

                    void main(){
                        vec3 lightDir = normalize(lightPos - vPosition);
                        vec3 viewDir = normalize(uCameraPos - vPosition);

                        vec3 halfwayDirection = normalize(lightDir + viewDir);
                        float spec = pow(max(dot(vNormal, halfwayDirection), 0.) * smoothstep(0.,1.,(1. - vUv.y) * 15.), LIGHT_SPREAD);
                        float sandstorm = max(texture2D(uCloudMap,fract(vUv * 10. + vec2(uTime * -0.8,uTime * 0.05))).r * 0.1 - 0.05,0.);
                        gl_FragColor = vec4(mix(vec3(0.),uDesertColor - 0.1 + vec3(sandstorm),spec),1.);
                    }
                `
            }),
            frontDesertGeometry = useMemo(()=>{
                const 
                    geometry = new THREE.PlaneGeometry(10,10,tSize-1,tSize-1).rotateX(Math.PI * -0.5),
                    positionArr = new Float32Array(Array.from(geometry.attributes.position.array)),
                    count = geometry.attributes.position.count

                for (let i=0; i<count; i++){
                    const j = i * 3 + 1
                    positionArr[j] = frontNoise[i * 4] * 0.25
                }
                
                geometry.setAttribute('position',new THREE.BufferAttribute(positionArr,3,false))
                geometry.translate(0,slideSize.y * -0.5 - 0.5,5)

                return geometry
            },[frontNoise,slideSize.y]),
            frontDesertMaterial = new THREE.RawShaderMaterial({
                defines:{
                    X_END:(slideSize.x * 0.5).toFixed(5),
                    Y:(slideSize.y * -0.5).toFixed(5),
                },
                uniforms:{
                    uDesertColor:{value:new THREE.Color(desertColor)},
                    transitionProgress:{value:0},
                },
                vertexShader:`
                    precision mediump float;
                    uniform mat4 modelViewMatrix, projectionMatrix;
                    attribute vec3 position, normal;
                    varying vec3 vPosition;

                    void main(){
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
                        vPosition = position;
                    }
                `,
                fragmentShader:`
                    precision lowp float;
                    uniform vec3 uDesertColor;
                    uniform float transitionProgress;
                    varying vec3 vPosition;

                    const vec3 screenNormal = vec3(0.,0.,1.);

                    void main(){
                        vec3 screenPos = vec3(clamp(vPosition.x,-X_END,X_END),Y,0.);
                        float distance = distance(vPosition,screenPos);
                        vec3 dir = normalize(vPosition - screenPos);
                        gl_FragColor = vec4(uDesertColor * dot(dir,screenNormal) * (inversesqrt(distance) - 0.5) * transitionProgress,1.);
                    }
                `
            }),
            slideRef = useRef(-1),
            slideProgressRef = useRef(0),
            gap = useRef(0.1).current,
            inRange = useRef(false),
            transitioning = useRef(false),
            isInRange = () => {
                inRange.current = true
                if (!modalOn.current && windowVisible.current && inRange.current) invalidate()
            },
            notInRange = () => {
                inRange.current = false
            },
            onMouseMove = (e:MouseEvent) => {
                if (mobile) return
                const 
                    {innerHeight,innerWidth} = window,
                    unitPixel = 0.2 / (Math.max(innerHeight,innerWidth) * 0.5),
                    x = (e.clientX - innerWidth * 0.5) * unitPixel,
                    y = (-e.clientY + innerHeight * 0.5) * unitPixel,
                    newCameraPosition = new THREE.Vector3(x,y,1).normalize().multiplyScalar(5)
                camera.position.set(newCameraPosition.x,newCameraPosition.y,newCameraPosition.z)
                camera.lookAt(0,0,0)
            },
            onClick = () => {
                if (transitioning.current || slideRef.current < 0 || slideRef.current >= works.length) return
                document.getElementById(works[slideRef.current].slug)?.click()
            },
            trigger = useRef<ScrollTrigger>(),
            onResize = () => {
                if (!!trigger.current) trigger.current.kill(true)
                trigger.current = ScrollTrigger.create({
                    trigger:'#cinema-container',
                    start:`top 0%`,
                    end:'bottom 0%',
                    scrub:true,
                    onEnter:isInRange,
                    onEnterBack:isInRange,
                    onLeave:notInRange,
                    onLeaveBack:notInRange,
                    onRefresh:({isActive})=>{
                        inRange.current = isActive
                        if (isActive) invalidate()
                    },
                    onUpdate:({progress})=>{
                        slideRef.current = Math.floor(progress * (works.length + 2)) - 1
                        slideProgressRef.current = progress * (works.length + 2) % 1
                    }
                })
            },
            windowVisible = useRef(true),
            windowIsHidden = () => {
                windowVisible.current = false
            },
            windowIsVisible = () => {
                windowVisible.current = true;
                if (!modalOn.current && windowVisible.current && inRange.current) invalidate()
            },
            modalOn = useRef(false),
            modalStatusOnChange = (e:any) => {
                modalOn.current = e.detail as boolean
                if (!modalOn.current && windowVisible.current && inRange.current) invalidate()
            }

        useEffect(()=>{
            const container = document.getElementById('cinema-container')

            onResize()
            window.addEventListener('mousemove',onMouseMove)
            window.addEventListener('resize',windowIsVisible)
            window.addEventListener('focus',windowIsVisible)
            window.addEventListener('blur',windowIsHidden)
            ScrollTrigger.addEventListener('refreshInit',onResize)
            container.addEventListener('modal',modalStatusOnChange)

            return () => {
                window.removeEventListener('mousemove',onMouseMove)
                window.removeEventListener('resize',windowIsVisible)
                window.removeEventListener('focus',windowIsVisible)
                window.removeEventListener('blur',windowIsHidden)
                ScrollTrigger.removeEventListener('refreshInit',onResize)
                container.addEventListener('modal',modalStatusOnChange)
            }
        },[])

        useEffect(()=>{
            getTextureSpecs()
        },[slideSize])

        useFrame(({camera:{position},invalidate},delta)=>{
            if (windowVisible.current && inRange.current && !modalOn.current) invalidate()

            const noShow = slideRef.current < 0 && slideProgressRef.current < 1 - gap * 0.5 || slideRef.current > works.length || slideRef.current === works.length && slideProgressRef.current > gap * 0.5
            screenMaterial.uniforms.noShow.value = noShow

            const 
                turningOn = slideRef.current === -1 && slideProgressRef.current > 1 - gap * 0.5 || slideRef.current === 0 && slideProgressRef.current < gap * 0.5,
                turningOff = slideRef.current === works.length - 1 && slideProgressRef.current > 1 - gap * 0.5 || slideRef.current === works.length && slideProgressRef.current < gap * 0.5
                
            transitioning.current = slideProgressRef.current > 1 - gap * 0.5 || slideProgressRef.current < gap * 0.5

            screenMaterial.uniforms.turningOnOff.value = turningOn || turningOff

            let transitionProgress = 0
            if (turningOff) transitionProgress = slideProgressRef.current > 0.5 ? (Math.abs(slideProgressRef.current - 1) + gap * 0.5) / gap : (slideProgressRef.current * -1 + gap * 0.5) / gap
            else if (transitioning.current) transitionProgress = slideProgressRef.current > 0.5 ? (slideProgressRef.current - (1 - gap * 0.5)) / gap : (slideProgressRef.current + gap * 0.5) / gap
            screenMaterial.uniforms.transitionProgress.value = transitionProgress
            screenMaterial.uniforms.transitioning.value = transitioning.current
            frontDesertMaterial.uniforms.transitionProgress.value = noShow ? 0 : turningOff || turningOn ? transitionProgress : 1

            if (!!textureSpecs.current.length) {
                const slide = slideProgressRef.current < gap * 0.5 ? slideRef.current - 1 : slideRef.current
                if (slide <= 0) screenMaterial.uniforms.textureSets.value = textureSpecs.current.slice(0,2)
                else if (slide >= works.length -1) screenMaterial.uniforms.textureSets.value = Array(2).fill(textureSpecs.current[works.length - 1])
                else screenMaterial.uniforms.textureSets.value = textureSpecs.current.slice(slide,slide + 2)
            }
            skyMaterial.uniforms.uTime.value += delta
            backDesertMaterial.uniforms.uTime.value += delta
            backDesertMaterial.uniforms.uCameraPos.value = position
        })

        return (
            <>
            <mesh 
                args={[screenGeometry,screenMaterial]} 
                onClick={onClick}
            />
            <mesh args={[frontDesertGeometry,frontDesertMaterial]} />
            <mesh args={[backDesertGeometry,backDesertMaterial]} />
            <mesh args={[skyGeometry,skyMaterial]} />
            </>
        )
    },
    Background = () => {
        const 
            pnSpec = useRef({px:512,size:8}).current,
            [frontNoise,setFrontNoise] = useState<Uint8Array>(new Uint8Array(4 * pnSpec.px * pnSpec.px)),
            [desertNoise,setDesertNoise] = useState<Uint8Array>(new Uint8Array(4 * pnSpec.px * pnSpec.px))

        useEffect(()=>{
            const 
            blob = new Blob([document.querySelector('#perlin-noise-worker').textContent], { type: "text/javascript" }),
            worker = new Worker(window.URL.createObjectURL(blob))
            worker.postMessage(pnSpec)
            worker.addEventListener('message',e=>{
                setFrontNoise(e.data.frontNoise as Uint8Array)
                setDesertNoise(e.data.desertNoise as Uint8Array)
            })
        },[])

        return (
            <div style={{position:'fixed',height:'100vh',width:'100vw',bottom:'0px',left:'0px'}}>
                <Context.Consumer>{({devicePixelRatio})=>
                    <Canvas camera={{far:10000}} dpr={devicePixelRatio} frameloop='demand' gl={{antialias:true}} onCreated={canvasIsLoaded}>
                        <Scene {...{frontNoise,desertNoise,tSize:pnSpec.px}} />
                    </Canvas>
                }</Context.Consumer>
            </div>
        )
    }

export default Background;