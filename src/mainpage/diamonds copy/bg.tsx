import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import {Context} from "../../context";
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/dist/ScrollTrigger';

const 
    Scene = () => {
        gsap.registerPlugin(ScrollTrigger)
        const 
            srcGLTF = useLoader(GLTFLoader,'/gemstone.glb',loader=>{
                const dracoLoader = new DRACOLoader();
                dracoLoader.setDecoderPath('/draco/gltf/');
                loader.setDRACOLoader(dracoLoader);
            }),
            {srcGeom,radius} = useMemo(()=>{
                const 
                    srcGeom = (srcGLTF.scene.children[0] as THREE.Mesh).geometry,
                    radius = srcGeom.boundingSphere.radius;
                return {srcGeom,radius}
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
            instancedGeometry = useMemo(()=>{
                const instancedGeometry = new THREE.InstancedBufferGeometry().copy(srcGeom);

                let 
                    translateArr:number[] = [],
                    maxTravelY:number[] = [],
                    fallSpeedArr:number[] = [],
                    rotateSpeedArr:number[] = [],
                    initialAngleArr:number[] = [],
                    instanceCount = 0;

                for (let z = 0; z > -100; z-=radius * 4){
                    const 
                        thisWidth = width * (position.z - z) / position.z,
                        thisHeight = thisWidth * height / width + radius * 4,
                        widthLimit = Math.ceil(thisWidth * 0.5);

                    for (let x = -widthLimit; x <= widthLimit; x+=radius * 2.5){
                        instanceCount++;
                        const y = Math.random() * thisHeight;
                        translateArr.push(x,y,z)
                        maxTravelY.push(thisHeight)
                        fallSpeedArr.push(Math.random() * 2 + 1)
                        initialAngleArr.push(Math.random() * Math.PI * 2 - Math.PI, Math.random() * Math.PI * 2 - Math.PI)
                        rotateSpeedArr.push(Math.random() * 4 - 2, Math.random() * 2 - 1)
                    }
                }

                instancedGeometry.instanceCount = instanceCount;
                instancedGeometry.setAttribute('translate',new THREE.InstancedBufferAttribute(new Float32Array(translateArr),3,false,1));
                instancedGeometry.setAttribute('fallSpeed',new THREE.InstancedBufferAttribute(new Float32Array(fallSpeedArr),1,false,1));
                instancedGeometry.setAttribute('initialAngle',new THREE.InstancedBufferAttribute(new Float32Array(initialAngleArr),2,false,1));
                instancedGeometry.setAttribute('rotSpeed',new THREE.InstancedBufferAttribute(new Float32Array(rotateSpeedArr),2,false,1));
                instancedGeometry.setAttribute('maxY',new THREE.InstancedBufferAttribute(new Float32Array(maxTravelY),1,false,1));
                
                return instancedGeometry
            },[height,width]),
            material = new THREE.RawShaderMaterial({
                glslVersion: THREE.GLSL3,
                uniforms:{
                    uTime:{value:0},
                    camPos:{value:position},
                    bloom:{value:false}
                },
                defines:{
                    RADIUS:radius
                },
                vertexShader:`
                    precision mediump float;

                    uniform mat4 modelViewMatrix, projectionMatrix;
                    uniform float uTime;
                    in vec3 position, normal, translate;
                    in vec2 rotSpeed, initialAngle;
                    in float maxY, fallSpeed;
                    out vec3 vNormal, vPosition;
                    out float vPrint;

                    void main(){
                        float x = initialAngle.x + uTime * rotSpeed.x;
                        float y = initialAngle.y + uTime * rotSpeed.y;

                        // rotational matrix
                        float cx = cos(x);
                        float sx = sin(x);
                        float cy = cos(y);
                        float sy = sin(y);

                        mat3 mx = mat3(cx,-sx,0., sx,cx,0., 0.,0.,1.);
                        mat3 my = mat3(cy,0.,sy, 0.,1.,0., -sy,0.,cy);
                        mat3 m = mx * my;

                        // transform normal while position rotates
                        vNormal = normal * transpose(inverse(m));

                        vec3 t = translate;
                        t.y -= uTime * fallSpeed;
                        t.y = mod(t.y,maxY);
                        vPrint = t.y > RADIUS && t.y < maxY - RADIUS ? 1. : 0.;
                        t.y -= maxY * 0.5;

                        vPosition = position * m + t;

                        gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition,1.);
                    }
                `,
                fragmentShader:`
                    precision lowp float;

                    uniform vec3 camPos;
                    uniform bool bloom;

                    in vec3 vNormal, vPosition;
                    in float vPrint;
                    out vec4 color;

                    const float i = 80.;
                    const float j = 100.;

                    float strength(vec3 viewDir, vec3 lightSrc){
                        vec3 halfwayDir = normalize(lightSrc - viewDir);
                        float e = max(dot(halfwayDir,vNormal),0.);
                        return pow(e,bloom ? 30. : 20.) * (bloom ? 0.05 : 0.2);
                    }

                    void main(){
                        if (vPrint==0.) discard;

                        float d;
                        vec3 viewDir = normalize(camPos - vPosition);

                        d += strength(viewDir,camPos);
                        d += strength(viewDir,vec3(-i,i,j));
                        d += strength(viewDir,vec3(i,i,j));
                        d += strength(viewDir,vec3(i,-i,j));
                        d += strength(viewDir,vec3(-i,-i,j));

                        if (!bloom) d += 0.05;

                        color = vec4(vec3(d), 1.);
                    }
                `
            }),
            invalidate = useThree(state => state.invalidate),
            windowVisible = useRef(true),
            inRange = useRef(false),
            windowIsHidden = () => {
                windowVisible.current = false
            },
            windowIsVisible = () => {
                windowVisible.current = true;
                invalidate();
            },
            isInRange = () => {
                inRange.current = true
                invalidate()
            },
            notInRange = () => {
                inRange.current = false
            }

        useEffect(()=>{
            const triggerAnimate = ScrollTrigger.create({
                trigger:'#diamonds-container',
                start:`top 0%`,
                end:`bottom 0%`,
                scrub:true,
                onEnter:isInRange,
                onEnterBack:isInRange,
                onLeave:notInRange,
                onLeaveBack:notInRange,
            })
            window.addEventListener('resize',windowIsVisible)
            window.addEventListener('focus',windowIsVisible)
            window.addEventListener('blur',windowIsHidden)

            return () => {
                triggerAnimate.kill()
                window.removeEventListener('resize',windowIsVisible)
                window.removeEventListener('focus',windowIsVisible)
                window.removeEventListener('blur',windowIsHidden)
            }
        },[])

        useFrame(({invalidate},delta)=>{
            if (windowVisible.current && inRange.current) invalidate()
            material.uniforms.uTime.value += delta
        })

        return (
            <mesh args={[instancedGeometry,material]} />
        )
    },
    Background = () => (
        <Context.Consumer>{({devicePixelRatio})=>
            <Canvas
                dpr={devicePixelRatio}
                camera={{fov: 30, near: 0.1, far: 1000, position: [0, 0, 25]}}
                frameloop='demand'
                gl={{antialias:true}}
                style={{position:'fixed',height:'100vh',width:'100vw',top:'0px'}}
            >
                <Scene />
            </Canvas>
        }</Context.Consumer>
    )

export default Background;