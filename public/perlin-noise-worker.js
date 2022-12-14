const
    smoothStep = t => t*t*t*(t*(t*6-15)+10),
    interpolate = (e0,e1,x) => (e1 - e0) * x + e0,
    getDotProduct = (angleCornerNoPi,xCoord,yCoord,cornerX,cornerY) => {
        let angleSelf = 0;

        if (cornerX === 0){
            if (cornerY === 0) angleSelf = Math.PI * 0.5 + Math.atan(yCoord / xCoord);
            else angleSelf = Math.PI * 0.5 - Math.atan((1 - yCoord) / xCoord);
        } else {
            if (cornerY === 0) angleSelf = Math.PI * 1.5 - Math.atan(yCoord / (1 - xCoord))
            else angleSelf = Math.PI * 1.5 + Math.atan((1 - yCoord) / (1 - xCoord));
        }

        const angleCorner = angleCornerNoPi * Math.PI * 2;

        let angleBetween = angleCorner > angleSelf ? angleCorner - angleSelf : angleSelf - angleCorner;
        if (angleBetween >= Math.PI) angleBetween = Math.PI * 2 - angleBetween;
        
        const 
            vectorLen = Math.sqrt(Math.pow(cornerX - xCoord, 2) + Math.pow(cornerY - yCoord,2)),
            result = (vectorLen * Math.max(Math.min(Math.cos(angleBetween),1),-1))
        
        return isNaN(result) ? 0.5 : result * 0.5 + 0.5
    }

self.onmessage = ({data}) => {
    const 
        {px,size} = data,
        cellSize = px / size,
        srcArr = Array.from(Array(size).keys(),()=>new Float32Array(Array.from(Array(size).keys(),()=>Math.random())))

    let 
        frontNoise = new Float32Array(px * px * 4),
        desertNoise = new Float32Array(px * px * 4)

    for (let y=0; y<px; y++){
        const 
            yCoord = (y % cellSize) / cellSize,
            yInterpolate = smoothStep(yCoord),
            top = Math.floor(y / cellSize),
            bottom = top === size - 1 ? 0 : top + 1

        for (let x=0; x<px; x++){
            const 
                i = 4 * (px * y + x),

                xCoord = (x % cellSize) / cellSize,
                xInterpolate = smoothStep(xCoord),
                left = Math.floor(x / cellSize),
                right = left === size - 1 ? 0 : left + 1,
                dTopLeft = getDotProduct(srcArr[top][left],xCoord,yCoord,0,0),
                dTopRight = getDotProduct(srcArr[top][right],xCoord,yCoord,1,0),
                dBottomLeft = getDotProduct(srcArr[bottom][left],xCoord,yCoord,0,1),
                dBottomRight = getDotProduct(srcArr[bottom][right],xCoord,yCoord,1,1),
                dTop = interpolate(dTopLeft,dTopRight,xInterpolate),
                dBottom = interpolate(dBottomLeft,dBottomRight,xInterpolate),
                d = interpolate(dTop,dBottom,yInterpolate),
                dd = d * Math.min(1,Math.min(y / cellSize,1))

            for (let z=0; z<4; z++){
                frontNoise[i+z] = d
                desertNoise[i+z] = dd
            }
        }
    }
    self.postMessage({frontNoise,desertNoise})
}