function initializeLabels (
    props,
    labels,
    charX,
    charWidth,
    charLines
) {
    for (let label of labels) {
        label.segments = (getSegments(label, charLines, charX, charWidth, props));
    }
}

function copyLabels (labels) {
    if (
        labels === undefined || 
        labels === null ||
        labels.length === 0
    ){
        return [];
    }

    let res = [];
    for (let i = 0; i < labels.length; i++) {
        let l = labels[i];
        try {
            let r = {};
            r.name = l.name;
            r.startIndex = parseInt(l.startIndex);
            r.endIndex = parseInt(l.endIndex);
            if (l.textColor !== undefined) {
                r.textColor = l.textColor;
            }
            res.push(r);
        } catch (e) {
            console.error(e);
        }
    }
    return res;
}

const getSegments = (label, charLines, charX, charWidth, props) => {
    if (charLines.length === 0) return [];

    let startLine; // use bisection to find starting line
    if (charLines[0][1] >= label.startIndex) {
        startLine = 0;
    } else {
        let left = 0;
        let right = charLines.length - 1;
        while (left < right - 1) {
            let mid = Math.floor((left + right)/2);
            if (charLines[mid][1] < label.startIndex) {
                left = mid;
            } else {
                right = mid;
            }
        }
        startLine = right;
    }

    let endLine; // use bisection to find ending line
    if (charLines[charLines.length - 1][0] <= label.endIndex) {
        endLine = charLines.length - 1;
    } else {
        let left = 0;
        let right = charLines.length - 1;
        while (left < right - 1) {
            let mid = Math.floor((left + right)/2);
            if (charLines[mid][0] > label.endIndex) {
                right = mid;
            } else {
                left = mid;
            }
        }
        endLine = left;        
    }

    let segments = [];
    let mid = Math.floor((label.startIndex + label.endIndex) /2);
    for (let i = startLine; i <= endLine; i++) {
        let seg = {};
        seg.belongsTo = label;
        seg.lineIndex = i;
        seg.start = Math.max(label.startIndex, charLines[i][0]);
        seg.end = Math.min(label.endIndex, charLines[i][1]);
        seg.leftBound = charX[seg.start];
        seg.rightBound = charX[seg.end] + charWidth[seg.end];
        if (seg.start <= mid && seg.end >= mid) {
            let [tag, tagXOffset, tagWidth] = (
                getLabelTagAndOffset(
                    label, 
                    charX, 
                    charWidth, 
                    props,
                    seg.start,
                    seg.end
                )
            );
            seg.tag = tag;
            seg.tagXOffset = tagXOffset;
            seg.leftBound = Math.min(seg.leftBound, seg.tagXOffset);
            seg.rightBound = Math.max(
                seg.rightBound,
                seg.tagXOffset + tagWidth
            );
        }
        segments.push(seg);
    }
    return segments;
};

const getLabelTagAndOffset = (
    label, 
    charX, 
    charWidth, 
    props,
    lineStart,
    lineEnd,
) => {

    let fontSize = parseInt(props.displaySettings.fontSize);
    if (isNaN(fontSize)) {
        fontSize = 30;
    }
    
    let padding = parseInt(props.displaySettings.padding);
    if (isNaN(padding)) {
        padding = 30;
    }

    let charGap = parseInt(props.displaySettings.charGap);
    if (isNaN(charGap)) {
        charGap = 0;
    }

    let lineGap = parseInt(props.displaySettings.lineGap);
    if (isNaN(lineGap)) {
        lineGap = 20;
    }

    let labelFontSize = parseInt(props.displaySettings.labelFontSize);
    if (isNaN(labelFontSize)) {
        labelFontSize = 15;
    }

    let labelGap = parseInt(props.displaySettings.labelGap);
    if (isNaN(labelGap)) {
        labelGap = 6;
    }

    let maxWidth = Math.round(0.125*props.canvasWidth);
    let ctx = document.createElement('canvas').getContext('2d');
    ctx.font = labelFontSize + 'px ' + props.displaySettings.labelFontFamily;
    let tag = label.name;
    let tagWidth = ctx.measureText(label.name).width;
    if (tagWidth > maxWidth) {
        tag = label.name.substring(0, 6) + '...';
        tagWidth = ctx.measureText(tag).width;
    };
    // let midIndex = Math.floor((label.start + label.end) /2);
    // let midX = Math.round(charX[midIndex] + 0.5*charWidth[midIndex]);
    let preLen = 0;
    for (let i = label.startIndex; i < lineStart; i++) {
        preLen += charWidth[i] + charGap;
    }
    let postLen = 0;
    for (let i = lineEnd + 1; i <= label.endIndex; i++) {
        postLen += charWidth[i] + charGap;
    }
    let midX = (charX[lineStart] + charX[lineEnd] + charWidth[lineEnd] + postLen - preLen)/2;
    let tagXOffset = Math.round(midX - 0.5*tagWidth);
    tagXOffset = Math.max(padding, tagXOffset);
    tagXOffset = Math.min(
        Math.round(props.canvasWidth - padding - tagWidth), 
        tagXOffset
    );
    return [tag, tagXOffset, tagWidth];
}


function getLabelTagContainer(label, ctx, props) {

    let fontSize = parseInt(props.displaySettings.fontSize);
    if (isNaN(fontSize)) {
        fontSize = 30;
    }
    
    let padding = parseInt(props.displaySettings.padding);
    if (isNaN(padding)) {
        padding = 30;
    }

    let charGap = parseInt(props.displaySettings.charGap);
    if (isNaN(charGap)) {
        charGap = 0;
    }

    let lineGap = parseInt(props.displaySettings.lineGap);
    if (isNaN(lineGap)) {
        lineGap = 20;
    }

    let labelFontSize = parseInt(props.displaySettings.labelFontSize);
    if (isNaN(labelFontSize)) {
        labelFontSize = 15;
    }

    let labelGap = parseInt(props.displaySettings.labelGap);
    if (isNaN(labelGap)) {
        labelGap = 6;
    }

    ctx.font = labelFontSize + 'px ' + props.displaySettings.labelFontFamily;
    let width = ctx.measureText(label.tagInfo[0]).width;
    let height = labelFontSize;
    let top = (label.tagInfo[2] - height);
    let left = (label.tagInfo[1]);

    let container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.height = (height+1) + 'px';
    container.style.width = width + 'px';
    container.style.top = top + 'px';
    container.style.left = left + 'px';
    container.style.zIndex = '2';
    container.style.cursor = 'pointer';
    return container;
}

export { initializeLabels, copyLabels };