import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import styles from './Canvas.module.scss'
import { BufferAttribute } from 'three/src/core/BufferAttribute';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { Triangle } from 'three/src/math/Triangle';
import { Vector3 } from 'three/src/math/Vector3';
import { Vector4 } from 'three/src/math/Vector4';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { Group } from 'three/src/objects/Group';
import { SkinnedMesh } from 'three/src/objects/SkinnedMesh';
import { Mesh } from 'three/src/objects/Mesh';
import { Points } from 'three/src/objects/Points';
import { Euler } from 'three/src/math/Euler';
import { AnimationMixer } from 'three/src/animation/AnimationMixer';

class SkinnedMeshSurfaceSampler{
    randomFunction:()=>number;
    positionAttribute:BufferAttribute;
    skinIndexAttribute:BufferAttribute;
    skinWeightAttribute:BufferAttribute;
    indice:BufferAttribute;
    distribution:Float32Array;

    constructor(geometry:BufferGeometry){
        if ( ! geometry.isBufferGeometry ) throw new Error('geometry missing')
        if ( geometry.attributes.position.itemSize !== 3 ) throw new Error('position error')
        if ( geometry.attributes.skinIndex.itemSize !== 4 ) throw new Error('skin index error')
        if ( geometry.attributes.skinWeight.itemSize !== 4 ) throw new Error('skin weight error')

        this.randomFunction = Math.random;
        this.positionAttribute = geometry.getAttribute( 'position' ) as BufferAttribute;
        this.skinIndexAttribute = geometry.getAttribute( 'skinIndex' ) as BufferAttribute;
        this.skinWeightAttribute = geometry.getAttribute( 'skinWeight' ) as BufferAttribute;
        this.indice = geometry.getIndex();

        const 
            faceWeights = new Float32Array( this.indice.count / 3 ),
            _face = new Triangle(),
            tempV3 = new Vector3();

        for (let i = 0; i < this.indice.count; i+= 3){
            tempV3.fromBufferAttribute(this.indice,i);

            if (tempV3.x % 1 !== 0 || tempV3.y % 1 !== 0 || tempV3.z % 1 !== 0) throw new Error('f')

            _face.a.fromBufferAttribute( this.positionAttribute, tempV3.x );
			_face.b.fromBufferAttribute( this.positionAttribute, tempV3.y );
			_face.c.fromBufferAttribute( this.positionAttribute, tempV3.z );

			faceWeights[ i / 3 ] = _face.getArea();
        }

        this.distribution = new Float32Array( this.indice.count / 3 );

		let cumulativeTotal = 0;

		for ( let i = 0; i < faceWeights.length; i ++ ) {
			cumulativeTotal += faceWeights[ i ];
			this.distribution[ i ] = cumulativeTotal;
		}
    }

    binarySearch( x:number ) {
		const dist = this.distribution;
		let start = 0;
		let end = dist.length - 1;

		let index = - 1;

		while ( start <= end ) {
			const mid = Math.ceil( ( start + end ) / 2 );
			if ( mid === 0 || dist[ mid - 1 ] <= x && dist[ mid ] > x ) {
				index = mid;
				break;
			} else if ( x < dist[ mid ] ) end = mid - 1;
            else start = mid + 1;
		}
		return index;
	}

    sample(targetPos:Vector3,targetSkinIndex:Vector4,targetSkinWeight:Vector4){
        const 
            cumulativeTotal = this.distribution[ this.distribution.length - 1 ],
            faceIndex = this.binarySearch( this.randomFunction() * cumulativeTotal ),
            faceIdxX3 = faceIndex * 3,
            v4a = new Vector4(),
            v4b = new Vector4(),
            v4c = new Vector4(),
            _face = new Triangle(),
            tempV3 = new Vector3();

        let u = Math.random();
        let v = Math.random();

        if ( u + v > 1 ) {
            u = 1 - u;
            v = 1 - v;
        }

        tempV3.fromBufferAttribute(this.indice,faceIdxX3)

        _face.a.fromBufferAttribute( this.positionAttribute, tempV3.x );
		_face.b.fromBufferAttribute( this.positionAttribute, tempV3.y );
		_face.c.fromBufferAttribute( this.positionAttribute, tempV3.z );

        targetPos
            .set( 0, 0, 0 )
            .addScaledVector( _face.a, u )
            .addScaledVector( _face.b, v )
            .addScaledVector( _face.c, 1 - ( u + v ) );

        // find index by distance to each of 3 vertex
        let benchmark = 9999;
        const xyz = 'xyz', abc = 'abc';
        [0,1,2].forEach(a=>{
            const d = targetPos.distanceTo(_face[abc[a]])
            if (d < benchmark) {
                benchmark = d
                targetSkinIndex.fromBufferAttribute( this.skinIndexAttribute, tempV3[xyz[a]] );
            }
        })

        // skin weight
        v4a.fromBufferAttribute( this.skinWeightAttribute, tempV3.x );
        v4b.fromBufferAttribute( this.skinWeightAttribute, tempV3.y );
        v4c.fromBufferAttribute( this.skinWeightAttribute, tempV3.z );

        targetSkinWeight
            .set( 0, 0, 0, 0 )
            .addScaledVector( v4a, u )
            .addScaledVector( v4b, v )
            .addScaledVector( v4c, 1 - ( u + v ) );
    }
}

const 
    a = Math.PI * 0.4,
    b = Math.PI * 0.5,
    tempPos = new Vector3(),
    tempSkinIndex = new Vector4(),
    tempSkinWeight = new Vector4(),
    particleCount = 20000,

    Scene = () => {
        const 
            camPos = useThree(state=>state.camera.position),
            camera = useThree(state=>state.camera),
            glDom = useThree(state=>state.gl.domElement),
            controls = new TrackballControls(camera,glDom),
            angleX = useRef(a),
            material = new ShaderMaterial({
                uniforms:{
                    ca:{value:Math.cos(a)},
                    sa:{value:Math.sin(a)},
                    cb:{value:Math.cos(b)},
                    sb:{value:Math.sin(b)},
                    camPos:{value:camPos},
                    uTime:{value:0}
                },
                vertexShader:`
                    attribute vec3 varInitialPos;
                    attribute vec2 rotSpeed;
                    uniform float ca,sa,cb,sb,uTime;
                    uniform vec3 camPos;
                    
                    #include <skinning_pars_vertex>

                    void main(){
                        mat4 modelViewProjectionMatrix = projectionMatrix * modelViewMatrix;
                        
                        #include <skinbase_vertex>

                        vec3 transformed = varInitialPos;

                        // particle random movement
                        float vTime = uTime * 5.;
                        float a = rotSpeed.x * vTime, c = cos(a), s = sin(a);
                        transformed.xz *= mat2(c,-s,s,c);
                        a = rotSpeed.y * vTime; c = cos(a); s = sin(a);
                        transformed.yz *= mat2(c,-s,s,c);

                        transformed += position;

                        #include <skinning_vertex>
    
                        transformed.yz *= mat2(ca,-sa,sa,ca);
                        transformed.xz *= mat2(cb,-sb,sb,cb);
                        transformed.x += cos(uTime);
                        transformed.z += sin(uTime);
                        transformed*=0.7;

                        gl_PointSize = 10. / distance(camPos,transformed);

                        gl_Position = modelViewProjectionMatrix * vec4( transformed, 1.0 );
                    }
                `,
                fragmentShader:`
                    void main(){
                        float d = distance(gl_PointCoord,vec2(0.5)) < 0.5 ? 0.1 : 0.;
                        gl_FragColor = vec4(1.,1.,1.,d);
                    }
                `,
                transparent:true,
                depthTest:false
            }),
            model = useLoader(GLTFLoader,'/bird.glb',loader=>{
                const dracoLoader = new DRACOLoader();
                dracoLoader.setDecoderPath('/draco/gltf/');
                loader.setDRACOLoader(dracoLoader);
            }),
            group = model.scene.children[0] as Group,
            skinnedMesh = group.children[1] as SkinnedMesh,
            geom = useMemo(()=>{
                if (!(group.children[1] as Mesh).geometry.index) return (group.children[1] as Mesh).geometry
                
                const 
                    sampler = new SkinnedMeshSurfaceSampler(skinnedMesh.geometry),
                    positions = new Float32Array(particleCount * 3),
                    rotSpeed = new Float32Array(particleCount * 2),
                    varInitialPos = new Float32Array(particleCount * 3),
                    skinIndice = new Uint8Array(particleCount * 4),
                    skinWeights = new Float32Array(particleCount * 4),
                    geom = new BufferGeometry();


                for ( let i = 0; i < particleCount; i++){
                    sampler.sample(tempPos,tempSkinIndex,tempSkinWeight)

                    positions[i * 3] = tempPos.x
                    positions[i * 3 + 1] = tempPos.y
                    positions[i * 3 + 2] = tempPos.z

                    skinIndice[i * 4] = tempSkinIndex.x
                    skinIndice[i * 4 + 1] = tempSkinIndex.y
                    skinIndice[i * 4 + 2] = tempSkinIndex.z
                    skinIndice[i * 4 + 3] = tempSkinIndex.w

                    skinWeights[i * 4] = tempSkinWeight.x
                    skinWeights[i * 4 + 1] = tempSkinWeight.y
                    skinWeights[i * 4 + 2] = tempSkinWeight.z
                    skinWeights[i * 4 + 3] = tempSkinWeight.w

                    tempPos
                        .set(Math.random() - 0.5,Math.random() - 0.5,Math.random() - 0.5)
                        .normalize()
                        .multiplyScalar(0.05)

                    varInitialPos[i * 3] = tempPos.x
                    varInitialPos[i * 3 + 1] = tempPos.y
                    varInitialPos[i * 3 + 2] = tempPos.z

                    rotSpeed[i * 2] = Math.random() * 20 - 10
                    rotSpeed[i * 2 + 1] = Math.random() * 20 - 10
                }
                
                geom.setAttribute('position',new BufferAttribute(positions,3))
                geom.setAttribute('varInitialPos',new BufferAttribute(varInitialPos,3))
                geom.setAttribute('rotSpeed',new BufferAttribute(rotSpeed,2))
                geom.setAttribute('skinIndex',new BufferAttribute(skinIndice,4))
                geom.setAttribute('skinWeight',new BufferAttribute(skinWeights,4))
                
                return geom
            },[]),
            points = new Points(geom,material) as any;

        points.matrixWorld.copy(skinnedMesh.matrixWorld);
        points.skeleton = skinnedMesh.skeleton;
        points.bindMatrix = skinnedMesh.bindMatrix;
        points.bindMatrixInverse = skinnedMesh.bindMatrixInverse;
        points.bindMode = skinnedMesh.bindMode;
        points.name = skinnedMesh.name;
        points.parent = skinnedMesh.parent;
    
        points.isSkinnedMesh = true;
        points.type = 'Mesh'

        if (group.children[1].type === 'SkinnedMesh'){
            group.remove(skinnedMesh)
            group.add(points)
        }

        group.position.set(0,0,0)
        group.setRotationFromEuler(new Euler( 0,0,0, 'XYZ' ))

        const mixer = new AnimationMixer(group)
        mixer.timeScale = 0.5

        mixer.clipAction(model.animations[1]).play()

        controls.rotateSpeed = 2
        controls.noPan = true
        
        useFrame((_,delta)=>{
            angleX.current += delta * 0.25;
            const material = (group.children[1] as SkinnedMesh).material as ShaderMaterial
            material.uniforms.cb.value = Math.cos(angleX.current)
            material.uniforms.sb.value = Math.sin(angleX.current)
            material.uniforms.uTime.value +=delta * 0.25
            mixer.update(delta)

            controls.update()
        })

        return (
            <primitive object={group} />
        )
    },
    ParticleAnimation = () => (
        <div className={styles.canvas}>
            <Canvas dpr={0.5}>
                <Scene />
                <EffectComposer>
                    <Bloom luminanceThreshold={0} luminanceSmoothing={0} height={1000} />
                </EffectComposer>
            </Canvas>
        </div>
    )

export default ParticleAnimation;