import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';
import {Context} from '../../context';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/dist/ScrollTrigger';

const 
    tWidth = 100,
    tHeight = 100,
    pos = new THREE.Vector3(),
    bi = new THREE.Vector3(),
    config = {
        count:5000,
        separation:5,
        perception:2,
        cohesion:2,
        speed:5,
        pointsize:20,
        state:true
    },
    positionFS = `
        uniform float count, speed;
        uniform sampler2D original;

        void main(){
            vec2 uv = gl_FragCoord.xy / resolution.xy;
            vec4 position = texture2D( tPosition, uv );
            vec4 velocity = texture2D( tVelocity, uv );
            gl_FragColor = vec4(normalize(position.xyz + velocity.xyz * velocity.w * speed), 1.);


            /*
            if (gl_FragCoord.y * resolution.x + gl_FragCoord.x < count){
                discard;
            } else {
                vec2 uv = gl_FragCoord.xy / resolution.xy;
                vec4 position = texture2D( tPosition, uv );
                vec4 velocity = texture2D( tVelocity, uv );
                gl_FragColor = vec4(normalize(position.xyz + velocity.xyz * velocity.w * speed), 1.);
            }
            */
            /*
            float width = resolution.x;
            vec2 uv = gl_FragCoord.xy / resolution.xy;
            vec4 position = texture2D( tPosition, uv );
            position.w = gl_FragCoord.y * width + gl_FragCoord.x < count ? 1. : 0.;
            if (position.w == 0.) {
                gl_FragColor = position;
                return;
            } else {
                vec4 velocity = texture2D( tVelocity, uv );
                gl_FragColor = vec4(normalize(position.xyz + velocity.xyz * velocity.w * speed), 1.);
            }*/
        }
    `,
    velocityFS = `
        uniform sampler2D original;

        #define SEPARATION 0.01
        #define PERCEPTION 0.25
        #define COHESION 0.1

        const int width = int(resolution.x);
        const int height = int(resolution.y);

        vec4 newVelo(vec4 velocity,vec4 positionSet){
            vec3 position = positionSet.xyz;
            vec3 dir = velocity.xyz;
            float speed = velocity.w;

            int coordX = int(gl_FragCoord.x);
            int coordY = int(gl_FragCoord.y);

            vec3 alignDir;
            float alignSpeed;
            float alignCount;

            bool shouldSep = false;
            vec3 dSep;

            vec3 coh;
            float cohCount;

            for (int j=0; j<height; j++){
                vec2 thisUV = vec2(0,j) / resolution.xy;
                vec4 thisPositionSet = texture2D( tPosition, thisUV );
                if (thisPositionSet.w == 0.) break;
                for (int i=0; i<width; i++){
                    if (j == coordY && i == coordX) continue;

                    thisUV = vec2(i,j) / resolution.xy;
                    thisPositionSet = texture2D( tPosition, thisUV );
                    if (thisPositionSet.w == 0.) break;

                    vec3 thisPos = thisPositionSet.xyz;

                    float dis = distance(position,thisPos) * R;

                    // alignment
                    if (dis < PERCEPTION){
                        vec4 thisVel = texture2D( tVelocity, thisUV );
                        alignDir += thisVel.xyz;
                        alignSpeed += thisVel.w;
                        alignCount ++;
                    }

                    // separation
                    if (dis < SEPARATION){
                        float newDisFactor = SEPARATION / dis - 1.;
                        dSep += (position - thisPos) / newDisFactor;
                        if (!shouldSep) shouldSep = true;
                    }

                    // cohesion
                    if (dis < COHESION){
                        coh += thisPos;
                        cohCount ++;
                    }
                }
            }

            if (shouldSep) dir = normalize(dir * 0.9 + normalize(dSep) * 0.1);

            if (cohCount > 0.){
                coh = normalize(coh / cohCount - position);
                dir = normalize(dir * 0.99 + coh * 0.01);
            }

            if (alignCount > 0.){
                dir = normalize(dir * 0.99 + normalize(alignDir) * 0.01);
                speed = speed * 0.9 + alignSpeed * 0.1 / alignCount;
            }

            dir = cross(position,dir);
            dir = cross(dir,position);

            return vec4(dir,speed);
        }

        void main(){
            vec2 uv = gl_FragCoord.xy / resolution.xy;
            vec4 velocity = texture2D( tVelocity, uv );
            vec4 positionSet = texture2D( tPosition, uv );

            if (positionSet.w == 0.) gl_FragColor =  velocity;
            else gl_FragColor = newVelo(velocity,positionSet);
        }
    `,
    materialVS = `
        precision mediump float;

        uniform mat4 modelViewMatrix, projectionMatrix;
        uniform sampler2D positionTexture;
        uniform float pointsize;//, uOpacity;
        uniform vec3 cameraPos;
        attribute vec3 position;

        varying vec3 vColor;
        varying float print;
        varying float opacity;

        void main(){
            vec2 uv = position.xy;
            vec4 tPositionSet = texture2D(positionTexture,uv);
            if (tPositionSet.w == 0.){
                print = 0.;
                gl_Position = projectionMatrix * modelViewMatrix * tPositionSet;
                return;
            } else {
                print = 1.;
                vec3 tPosition = tPositionSet.xyz;
                vColor = tPosition + 1.;
                vColor = normalize(vColor);
                vColor = min(vColor + 0.6,1.);
                float opacitytBack = 0.2;
                float a = 0.5 - 0.5 * opacitytBack;
                opacity = (tPosition.z * a + 1. - a) * 0.5;// * uOpacity;
                tPosition *= R;
                gl_PointSize = max(pointsize / distance(cameraPos, tPosition),6.);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(tPosition,1.);
            }
        }
    `,
    materialFS = `
        precision lowp float;
        varying vec3 vColor;
        varying float print;
        varying float opacity;

        void main(){
            if (print == 0.) discard;
            gl_FragColor = vec4(vColor,distance(gl_PointCoord,vec2(0.5)) < 0.5 ? opacity : 0.);
        }
    `,
    createGpuTexture = (
        gpuCompute: GPUComputationRenderer, 
        arr:Float32Array,
        textureName:string,
        shader:string
    ) => {
        const texture = gpuCompute.createTexture();
        texture.image.data.set(arr)
        return gpuCompute.addVariable(textureName,shader,texture);
    },
    createInitialTexture = (arr:Float32Array) => new THREE.DataTexture(
        arr,
        tWidth,
        tHeight,
        THREE.RGBAFormat,
        THREE.FloatType,
        THREE.UVMapping,
        THREE.RepeatWrapping,
        THREE.RepeatWrapping
    ),
    Scene = () => {
        gsap.registerPlugin(ScrollTrigger)
        const
            {
                r,
                particleCount,
            } = useThree(state=>{
                const 
                    {camera:{position},size} = state,
                    fov = (state.camera as THREE.PerspectiveCamera).fov,
                    fovInRad = fov * 0.5 * Math.PI / 180,
                    height = Math.tan(fovInRad) * position.z * 2,
                    r = Math.min(200,size.height * 0.35, size.width * 0.4) * height / size.height,
                    particleCount = Math.floor(Math.min(0.125 * Math.pow(r * size.height / height,2),config.count))
                
                return {
                    r,
                    particleCount,
                }
            }),
            gl = useThree(state => state.gl),
            invalidate = useThree(state => state.invalidate),
            geometry = useMemo(()=>new THREE.PlaneGeometry(1,1,tWidth, tHeight),[]),
            windowVisible = useRef(true),
            windowIsHidden = () => {
                windowVisible.current = false
            },
            windowIsVisible = () => {
                windowVisible.current = true;
                invalidate();
            },
            latestDelta = useRef(0),
            {positions,velocities} = useMemo(()=>{
                const 
                    len = tWidth * tHeight * 4,
                    positions = new Float32Array(len),
                    velocities = new Float32Array(len);

                for (let i = 0; i < len; i+=4) {
                    pos.set(Math.random() - 0.5,Math.random() - 0.5,Math.random() - 0.5)
                    pos.normalize()
                    positions[i] = pos.x
                    positions[i+1] = pos.y
                    positions[i+2] = pos.z
                    positions[i+3] = 0;

                    bi.set(Math.random() - 0.5,Math.random() - 0.5,Math.random() - 0.5).normalize();
                    pos.cross(bi).normalize() // random tangent
                    velocities[i] = pos.x
                    velocities[i+1] = pos.y
                    velocities[i+2] = pos.z
                    velocities[i+3] = Math.random()
                }

                return {positions,velocities};
            },[]),
            gpuCompute = new GPUComputationRenderer( tWidth, tHeight, gl ),
            positionFsRef = useRef(positionFS).current,
            velocityFsRef = useRef(velocityFS).current,
            materialVsRef= useRef(materialVS).current,
            materialFsRef = useRef(materialFS).current,
            positionVariable = createGpuTexture(gpuCompute,positions,'tPosition',positionFsRef),
            velocityVariable = createGpuTexture(gpuCompute,velocities,'tVelocity',velocityFsRef),
            positionInitial = useMemo(()=>createInitialTexture(positions),[positions]),
            velocityInitial = useMemo(()=>createInitialTexture(velocities),[velocities]),
            material = new THREE.RawShaderMaterial({
                uniforms:{
                    positionTexture:{value:null},
                    cameraPos:{value:null},
                    pointsize:{value:config.pointsize},
                },
                defines:{
                    R:r
                },
                vertexShader:materialVsRef,
                fragmentShader:materialFsRef,
                transparent:true,
                depthTest:false
            }),
            inRange = useRef(true),
            isInRange = () => {
                inRange.current = true
                invalidate()
            },
            notInRange = () => inRange.current = false

        gpuCompute.setVariableDependencies( positionVariable, [ positionVariable, velocityVariable ] );
        gpuCompute.setVariableDependencies( velocityVariable, [ positionVariable, velocityVariable ] );

        positionVariable.material.uniforms.count = {value:particleCount};
        positionVariable.material.uniforms.speed = {value:config.speed * 0.001};
        positionVariable.material.uniforms.original = {value:positionInitial}
        velocityVariable.material.uniforms.original = {value:velocityInitial}
        velocityVariable.material.defines.R = r;

        var error = gpuCompute.init();

        if ( error !== null ) {
            console.error( error );
        }

        useFrame(({camera:{position},invalidate},delta)=>{
            if (windowVisible.current && inRange.current) invalidate()
            if (delta < 0.05) latestDelta.current = delta;
            
            gpuCompute.compute();
            positionVariable.material.uniforms.speed.value = config.speed * 0.001 * latestDelta.current * 50;
            material.uniforms.cameraPos.value = position;
            material.uniforms.positionTexture.value = gpuCompute.getCurrentRenderTarget( positionVariable ).texture;
            material.uniforms.pointsize.value = config.pointsize; 
        })

        useEffect(()=>{
            const trigger = ScrollTrigger.create({
                trigger:document.body,
                start:'top 0%',
                end:'top -100%',
                scrub:true,
                onEnter:isInRange,
                onEnterBack:isInRange,
                onLeave:notInRange,
            })

            window.addEventListener('resize',windowIsVisible)
            window.addEventListener('focus',windowIsVisible)
            window.addEventListener('blur',windowIsHidden)

            return () => {
                trigger.kill()
                window.removeEventListener('resize',windowIsVisible)
                window.removeEventListener('focus',windowIsVisible)
                window.removeEventListener('blur',windowIsHidden)
            }
        },[])

        return (
            <points args={[geometry,material]} />
        )
    },
    Background = () => (
        <Context.Consumer>{({devicePixelRatio})=>
            <Canvas
                dpr={devicePixelRatio} 
                gl={{antialias:true}}
                frameloop='demand'
                style={{position:'absolute',top:'0',left:'0'}}
            >
                <Scene />
            </Canvas>
        }</Context.Consumer>
    )

export default Background;