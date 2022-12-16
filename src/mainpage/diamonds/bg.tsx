import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import {Context} from "../../context";
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/dist/ScrollTrigger';
import { canvasIsLoaded, cdnPrefix } from "../../common";

const 
    v2 = new THREE.Vector2(),
    v3 = new THREE.Vector3(),
    Scene = () => {
        gsap.registerPlugin(ScrollTrigger)
        const 
            srcGLTF = useLoader(GLTFLoader,cdnPrefix() + '/gemstone.glb',loader=>{
                const dracoLoader = new DRACOLoader();
                dracoLoader.setDecoderPath(cdnPrefix() + '/draco/gltf/');
                loader.setDRACOLoader(dracoLoader);
            }),
            {diaGeom,stoneMaxY} = useMemo(()=>{
                const 
                    diaGeom = (srcGLTF.scene.children[0] as THREE.Mesh).geometry,
                    stoneMaxY = Math.max(Math.abs(diaGeom.boundingBox.max.y),Math.abs(diaGeom.boundingBox.min.y));
                return {diaGeom,stoneMaxY}
            },[]),
            {position,height,width} = useThree(state=>{
                const 
                    {camera:{position},viewport:{aspect}} = state,
                    fov = (state.camera as THREE.PerspectiveCamera).fov,
                    fovInRad = fov * 0.5 * Math.PI / 180,
                    height = Math.tan(fovInRad) * position.z * 2,
                    width = height * aspect

                return {position,height,width}
            }),
            defaultCameraZ = useRef(position.z).current,
            zoomProgress = useRef(0),
            multiplier = useMemo(()=>{
                if (width < height) return Math.min(width * 0.5 * 0.7, 1.5, height * Math.min(300,window.innerHeight) / window.innerHeight * 0.5)
                return height * 0.5 * 0.8 * Math.min(300,window.innerHeight * 0.9) / window.innerHeight
            },[stoneMaxY,height,width]),
            fallProgress = useRef(0),
            diaMaterial = new THREE.RawShaderMaterial({
                glslVersion: THREE.GLSL3,
                uniforms:{
                    uTime:{value:0},
                    uFallProgress:{value:0},
                    camPos:{value:position},
                    opacity:{value:1},
                },
                defines:{
                    MULTIPLIER:multiplier.toFixed(4),
                    BOTTOM_H:stoneMaxY.toFixed(4),
                    SCREEN_H:height.toFixed(4)
                },
                vertexShader:`
                    precision mediump float;

                    uniform mat4 modelViewMatrix, projectionMatrix;
                    uniform float uTime, uFallProgress;
                    in vec3 position, normal, translate;
                    out vec3 vNormal, vPosition;

                    void main(){
                        float y = uTime;

                        // rotational matrix
                        float cy = cos(y);
                        float sy = sin(y);

                        mat3 my = mat3(cy,0.,sy, 0.,1.,0., -sy,0.,cy);

                        // transform normal while position rotates
                        vNormal = normal * transpose(inverse(my));

                        vPosition = position * my * MULTIPLIER + vec3(0.,(BOTTOM_H * MULTIPLIER + SCREEN_H * 0.5) * (1. - uFallProgress),0.);

                        gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition,1.);
                    }
                `,
                fragmentShader:`
                    precision lowp float;

                    uniform vec3 camPos;
                    uniform float opacity;

                    in vec3 vNormal, vPosition;
                    out vec4 color;

                    const float i = 80.;
                    const float j = 100.;

                    float strength(vec3 viewDir, vec3 lightSrc){
                        vec3 halfwayDir = normalize(lightSrc - viewDir);
                        float e = max(dot(halfwayDir,vNormal),0.);
                        return pow(e,50.) * 5.;
                    }

                    void main(){
                        float d;
                        vec3 viewDir = normalize(camPos - vPosition);

                        d += strength(viewDir,camPos);
                        d += strength(viewDir,camPos + vec3(0.,50.,0.));
                        d += strength(viewDir,camPos + vec3(0.,-20.,0.));
                        d += strength(viewDir,vec3(-i,i,j));
                        d += strength(viewDir,vec3(i,i,j));
                        d += strength(viewDir,vec3(i,-i,j));
                        d += strength(viewDir,vec3(-i,-i,j));

                        color = vec4(vec3(d), opacity);
                    }
                `,
                transparent:true
            }),
            sparkGeometry = useMemo(()=>{
                const 
                    geom = new THREE.BufferGeometry(),
                    count = 800,
                    directions = new Float32Array(count * 3)

                geom.setAttribute('position',new THREE.BufferAttribute(new Float32Array(count * 3),3,false))
                geom.setAttribute('startTime',new THREE.BufferAttribute(new Float32Array(Array.from(Array(count),()=>Math.random())),1,false))
                
                for (let i=0; i<count; i++){
                    v2.set(Math.sign(Math.random() - 0.5) * Math.random(),Math.sign(Math.random() - 0.5) * Math.random())
                    v2.normalize()
                    v3.set(v2.x,Math.random() * 0.4 + 0.2,v2.y)
                    v3.normalize()
                    directions[i * 3] = v3.x
                    directions[i * 3 + 1] = v3.y
                    directions[i * 3 + 2] = v3.z
                }

                geom.setAttribute('direction',new THREE.BufferAttribute(directions,3,true))
                geom.setAttribute('aLength',new THREE.BufferAttribute(new Float32Array(Array.from(Array(count),()=>Math.random())),1,false))

                return geom
            },[]),
            sparkMaterial = new THREE.RawShaderMaterial({
                uniforms:{
                    uTime:{value:0},
                    opacity:{value:1},
                    uFallProgress:{value:0},
                    uCamPos:{value:position},
                },
                defines:{
                    Y:(-stoneMaxY * multiplier).toFixed(3),
                    MULTIPLIER:multiplier.toFixed(4),
                    WIDTH:width.toFixed(4),
                    HEIGHT:height.toFixed(4),
                },
                vertexShader:`
                    precision mediump float;
                    uniform mat4 modelViewMatrix, projectionMatrix;
                    uniform vec3 uCamPos;
                    uniform float uTime,uFallProgress;
                    attribute vec3 position, direction;
                    attribute float startTime, aLength;
                    varying float vOpacity, vFallProgress;

                    void main(){
                        if (uFallProgress == 1.){
                            vec3 p = position + direction * pow(sin(radians(fract(startTime + uTime * 3.) * 90.)),0.5) * aLength * MULTIPLIER * 1.5 + vec3(0.,Y,0.);
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.);
                            gl_PointSize = 80. * MULTIPLIER * length(uCamPos) / (distance(p,uCamPos) * max(WIDTH,HEIGHT));
                            vOpacity = cos(radians(fract(startTime + uTime * 3.) * 90.));
                            vFallProgress = 1.;
                        } else {
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(0.);
                            gl_PointSize = 0.;
                        }
                    }
                `,
                fragmentShader:`
                    precision lowp float;
                    uniform float opacity;
                    varying float vOpacity, vFallProgress;

                    void main(){
                        if (vFallProgress == 1.) {
                            float distanceFromCenter = distance(vec2(0.5),gl_PointCoord);
                            float gradientOpacity = pow(smoothstep(0.5,0.0,distanceFromCenter),0.4) * 0.5;
                            gl_FragColor = vec4(vec3(1.),gradientOpacity * vOpacity * opacity);
                        } 
                        else discard;
                    }
                `,
                transparent:true,
                depthWrite:false
            }),
            invalidate = useThree(state => state.invalidate),
            windowVisible = useRef(true),
            inRange = useRef(false),
            isInRange = () => {
                inRange.current = true
                invalidate()
            },
            notInRange = () => inRange.current = false,
            windowIsHidden = () => {
                windowVisible.current = false
            },
            windowIsVisible = () => {
                windowVisible.current = true;
                invalidate();
            },
            triggerRange = useRef<ScrollTrigger>(),
            triggerFall = useRef<ScrollTrigger>(),
            triggerZoom = useRef<ScrollTrigger>(),
            updateFall = (progress:number) => {
                fallProgress.current = Math.pow(progress,2)
                invalidate()
            },
            updateZoom = (progress:number) => {
                zoomProgress.current = progress
                document.getElementById('desktop-menu').style.backgroundImage = progress > 0 && progress < 1 ? 'linear-gradient(rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0) 100%)' : null
                invalidate()
            },
            onRefreshInit = () => {
                if (!!triggerRange.current) triggerRange.current.kill(true)
                if (!!triggerFall.current) triggerFall.current.kill(true)
                if (!!triggerZoom.current) triggerZoom.current.kill(true)

                triggerRange.current = ScrollTrigger.create({
                    trigger:'#diamonds-container',
                    start:`top 0%`,
                    end:`bottom 0%`,
                    scrub:true,
                    onEnter:isInRange,
                    onEnterBack:isInRange,
                    onLeave:notInRange,
                    onLeaveBack:notInRange,
                    onRefresh:({isActive})=>{
                        if (isActive) isInRange() 
                        else notInRange()
                    }
                })

                triggerFall.current = ScrollTrigger.create({
                    trigger:'#diamonds-container',
                    start:`top 0%`,
                    end:`top -100%`,
                    scrub:true,
                    onRefresh:({progress})=>updateFall(progress),
                    onUpdate:({progress})=>updateFall(progress),
                })

                triggerZoom.current = ScrollTrigger.create({
                    trigger:'#diamonds-container',
                    start:'bottom 100%',
                    end:'bottom 0%',
                    scrub:true,
                    onUpdate:({progress})=>updateZoom(progress),
                    onRefresh:({progress})=>updateZoom(progress),
                })
            }
            

        useEffect(()=>{
            onRefreshInit()
            window.addEventListener('resize',windowIsVisible)
            window.addEventListener('focus',windowIsVisible)
            window.addEventListener('blur',windowIsHidden)
            ScrollTrigger.addEventListener('refreshInit',onRefreshInit)

            return () => {
                window.removeEventListener('resize',windowIsVisible)
                window.removeEventListener('focus',windowIsVisible)
                window.removeEventListener('blur',windowIsHidden)
                ScrollTrigger.removeEventListener('refreshInit',onRefreshInit)
            }
        },[])

        useFrame(({invalidate,camera:{position}},delta)=>{
            if (windowVisible.current && inRange.current) invalidate()
            const opacity = Math.pow(1 - zoomProgress.current,2)
            diaMaterial.uniforms.uTime.value += delta * 0.7
            diaMaterial.uniforms.uFallProgress.value = fallProgress.current
            diaMaterial.uniforms.opacity.value = opacity
            sparkMaterial.uniforms.uFallProgress.value = fallProgress.current
            sparkMaterial.uniforms.uTime.value += delta
            sparkMaterial.uniforms.opacity.value = opacity

            position.setZ((1 - zoomProgress.current) * defaultCameraZ)
        })

        return (
            <>
            <mesh args={[diaGeom,diaMaterial]} />
            <points args={[sparkGeometry,sparkMaterial]} />
            </>
        )
    },
    Background = () => (
        <div id='diamonds-canvas'>
            <Context.Consumer>{({devicePixelRatio})=>
                <Canvas
                    dpr={devicePixelRatio}
                    frameloop='demand'
                    gl={{antialias:true}}
                    onCreated={canvasIsLoaded}
                >
                    <Scene />
                </Canvas>
            }</Context.Consumer>
        </div>
    )

export default Background;