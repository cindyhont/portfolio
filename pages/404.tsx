import React from "react"
import ErrorPage from "../src/error-page"

export const config = {
    unstable_runtimeJS: false
};

const FourOFour = () => <ErrorPage errorCode={404} />
export default FourOFour