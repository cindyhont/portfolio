import { createContext } from "react";
import { IindexItem } from "./interfaces";

const 
    Context = createContext<{
        devicePixelRatio:number;
        webgl:boolean;
        imgFormat:'avif'|'webp'|'none'|'';
    }>({
        devicePixelRatio:2,
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