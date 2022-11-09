import { createContext } from "react";
import { IindexItem } from "./interfaces";

const 
    Context = createContext<{
        devicePixelRatio:number;
        mobile:boolean;
        isSafari:boolean;
    }>({
        devicePixelRatio:2,
        mobile:false,
        isSafari:false,
    }),
    IndexContext = createContext<{
        works:IindexItem[]
    }>({
        works:[]
    })

export {
    Context,
    IndexContext,
};