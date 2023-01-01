import React from "react";
import Waves from "../waves";
import styles from './Separator.module.scss'

const SeparatorContainer = (
    {
        wavePaths,
        children,
    }:{
        wavePaths:string[];
        children:JSX.Element;
    }
) => (
    <>
    <div className={styles.content}>{children}</div>
    <Waves paths={wavePaths} />
    </>
)

export default SeparatorContainer