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
    return labels.map(
        (l) => {
            let r = {};
            r.name = l.name;
            r.start = l.start;
            r.end = l.end;
            if (l.textColor !== undefined) {
                r.textColor = l.textColor;
            }
            if (l.highlightColor !== undefined) {
                r.highlightColor = l.highlightColor;
            }
            return r;
        }
    );
}

const getSegments = (label, charLines, charX, charWidth, props) => {
    if (charLines.length === 0) return [];

    let startLine; // use bisection to find starting line
    if (charLines[0][1] >= label.start) {
        startLine = 0;
    } else {
        let left = 0;
        let right = charLines.length - 1;
        while (left < right - 1) {
            let mid = Math.floor((left + right)/2);
            if (charLines[mid][1] < label.start) {
                left = mid;
            } else {
                right = mid;
            }
        }
        startLine = right;
    }

    let endLine; // use bisection to find ending line
    if (charLines[charLines.length - 1][0] <= label.end) {
        endLine = charLines.length - 1;
    } else {
        let left = 0;
        let right = charLines.length - 1;
        while (left < right - 1) {
            let mid = Math.floor((left + right)/2);
            if (charLines[mid][0] > label.end) {
                right = mid;
            } else {
                left = mid;
            }
        }
        endLine = left;        
    }

    let segments = [];
    let mid = Math.floor((label.start + label.end) /2);
    for (let i = startLine; i <= endLine; i++) {
        let seg = {};
        seg.belongsTo = label;
        seg.lineIndex = i;
        seg.start = Math.max(label.start, charLines[i][0]);
        seg.end = Math.min(label.end, charLines[i][1]);
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
    let maxWidth = Math.round(0.125*props.canvasWidth);
    let ctx = document.createElement('canvas').getContext('2d');
    ctx.font = props.labelFontSize + 'px ' + props.labelFontFamily;
    let tag = label.name;
    let tagWidth = ctx.measureText(label.name).width;
    if (tagWidth > maxWidth) {
        tag = label.name.substring(0, 6) + '...';
        tagWidth = ctx.measureText(tag).width;
    };
    // let midIndex = Math.floor((label.start + label.end) /2);
    // let midX = Math.round(charX[midIndex] + 0.5*charWidth[midIndex]);
    let preLen = 0;
    for (let i = label.start; i < lineStart; i++) {
        preLen += charWidth[i] + props.charGap;
    }
    let postLen = 0;
    for (let i = lineEnd + 1; i <= label.end; i++) {
        postLen += charWidth[i] + props.charGap;
    }
    let midX = (charX[lineStart] + charX[lineEnd] + charWidth[lineEnd] + postLen - preLen)/2;
    let tagXOffset = Math.round(midX - 0.5*tagWidth);
    tagXOffset = Math.max(props.padding, tagXOffset);
    tagXOffset = Math.min(
        Math.round(props.canvasWidth - props.padding - tagWidth), 
        tagXOffset
    );
    return [tag, tagXOffset, tagWidth];
}


function getLabelTagContainer(label, ctx, props) {
    ctx.font = props.labelFontSize + 'px ' + props.labelFontFamily;
    let width = ctx.measureText(label.tagInfo[0]).width;
    let height = props.labelFontSize;
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