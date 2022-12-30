import { createContext } from "react";
import { IindexItem } from "./interfaces";

const 
    Context = createContext<{
        devicePixelRatio:number;
        mobile:boolean;
        webgl:boolean;
        imgFormat:'avif'|'webp'|'none'|'';
    }>({
        devicePixelRatio:2,
        mobile:false,
        webgl:false,
        imgFormat:'',
    }),
    IndexContext = createContext<{
        works:IindexItem[]
    }>({
        works:[]
    }),
    NoiseContext = createContext<{perlinNoise:Float32Array}>({perlinNoise:new Float32Array()})

export {
    Context,
    IndexContext,
    NoiseContext,
};