import React from "react"
import ErrorPage from "../src/error-page"

export const config = {
    unstable_runtimeJS: false
};

const FiveHundred = () => <ErrorPage errorCode={500} />
export default FiveHundred