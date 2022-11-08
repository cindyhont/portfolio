import { createContext } from "react";
import { IindexItem } from "./interfaces";

const 
    Context = createContext<{
        devicePixelRatio:number;
        mobile:boolean;
    }>({
        devicePixelRatio:2,
        mobile:false,
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