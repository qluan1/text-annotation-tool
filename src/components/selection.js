function charAfterPosition(
    charX, 
    charY,
    charWidth,
    x, 
    y, 
    fontSize
) { 
    // return the index of the first char that comes after coordinate (x, y)
    let tolerance = 3;

    const isAfter = (i) => {
        let a = (2 * charX[i] + charWidth[i])/2;
        let b = charY[i];
        if (y <= b - fontSize - tolerance) return true;
        if (y <= b) return ( a >= x);
        return false;
    };

    if (charX.length === 0) return null;
    if (isAfter(0)) return 0;
    if (!isAfter(charX.length - 1)) return null;

    let left = 0;
    let right = charX.length - 1;
    while (left < right - 1) {
        let mid = Math.floor((left + right)/2);
        if (!isAfter(mid)) {
            left = mid;
        } else {
            right = mid;
        }
    }
    return right;
}

function charBeforePosition(
    charX, 
    charY,
    charWidth,
    x, 
    y, 
    fontSize
) {
    // return the index of the last char that comes before coordinate (x, y)
    let tolerance = 3;

    const isBefore = (i) => {
        let a = (2 * charX[i] + charWidth[i])/2;
        let b = charY[i];
        if (y > b + tolerance) return true;
        if (y > b - fontSize - tolerance && y > 0) return ( a < x);
        return false;
    }

    if (charX.length === 0) return null;
    if (isBefore(charX.length - 1)) return charX.length - 1;
    if (!isBefore(0)) return null;

    let left = 0;
    let right = charX.length - 1;
    while (left < right - 1) {
        let mid = Math.floor((left + right)/2);
        if (!isBefore(mid)) {
            right = mid;
        } else {
            left = mid;
        }
    }
    return left;
}

function getStartEndIndex(
    charX,
    charY,
    charWidth, 
    mouseX, 
    mouseY, 
    mouseDownX, 
    mouseDownY, 
    fontSize
) {
    let s1 = charAfterPosition(
        charX,
        charY,
        charWidth, 
        mouseX, 
        mouseY, 
        fontSize
    );
    let e1 = charBeforePosition(
        charX,
        charY,
        charWidth,
        mouseX, 
        mouseY, 
        fontSize
    );
    let s2 = charAfterPosition(
        charX,
        charY,
        charWidth,  
        mouseDownX, 
        mouseDownY, 
        fontSize
    );
    let e2 = charBeforePosition(
        charX,
        charY,
        charWidth,
        mouseDownX, 
        mouseDownY, 
        fontSize
    );

    if (s1 !== null && e2 !== null && s1 <= e2) {
        return [s1, e2];
    } else if (s2 !== null && e1 !== null && s2 <= e1) {
        return [s2, e1];          
    }
    return [null, null];
}

export {
    charAfterPosition, 
    charBeforePosition, 
    getStartEndIndex
};