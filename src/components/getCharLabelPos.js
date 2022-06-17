function parseStrLines(props) {
    let str = props.task.context;

    if (str === undefined || typeof(str) !== typeof('string')) {
        return [[], [], []];
    }
    let charX = Array(str.length);
    let charWidth = Array(str.length);
    let charLines = [];

    if (props.strLan === 'ENG') {
        parseEngLines(props, charX, charWidth, charLines);
    } else {
        parseNoneEngLines(props, charX, charWidth, charLines);
    }
    return [charX, charWidth, charLines];
}

function getCharLabelPos(
    props,
    charX,
    charWidth,
    charLines,
    labels,
) {
    // get the draw instruction for texts and labels

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

    let charY = Array(charX.length);
    let labelsDrawInstruction = [];
    let lines = Array(charLines.length);
    for (let i = 0; i < lines.length; i++) {
        lines[i] = [];
    }
    // each label may contain multiple segments
    // one segment of a label is the part of the labeling
    // on one line

    for (let label of labels) {
        for (let segment of label.segments) {
            // let s = [];
            // s.push(segment.leftBound);
            // s.push(segment.rightBound);
            // s.push(segment.start);
            // s.push(segment.end);
            // s.push(label.textColor);
            // if (segment.tag != undefined) {
            //     s.push(segment.tag);
            //     s.push(segment.tagXOffset);
            // }
            fitSegment(segment, lines[segment.lineIndex]);
        }
    }

    let yStart = padding;
    for (let i = 0; i < charLines.length; i++) {
        let layers = lines[i];
        for (let j = 0; j < layers.length; j++) {
            let layer = layers[layers.length - 1 - j];
            yStart += labelFontSize + labelGap;
            layer.forEach((seg) => {
                let inst = [];
                inst.push(charX[seg.start]);
                inst.push(yStart - labelGap + 4);
                inst.push(charX[seg.end] + charWidth[seg.end]);
                inst.push(seg.belongsTo.textColor);
                if (seg.tag !== undefined) {
                    // this segment will contain the tag/label-name
                    inst.push(seg.tag);
                    inst.push(seg.tagXOffset);
                    inst.push(yStart - labelGap);
                    seg.belongsTo.tagInfo = [seg.tag, seg.tagXOffset, yStart - labelGap];
                }
                labelsDrawInstruction.push(inst);
            });
        }

        yStart += fontSize;
        for (let j = charLines[i][0]; j <= charLines[i][1]; j++) {
            charY[j] = yStart;
        }
        yStart += lineGap;
    }

    return [charY, labelsDrawInstruction];
}

const fitSegment = (seg, layers) => {
    let current = layers.length - 1;
    while (current >= 0) {
        let canFit = true;
        for (let s of layers[current]) {
            if ( // if two segments are NOT disjoint
                !(
                    seg.leftBound > s.rightBound ||
                    s.leftBound > seg.rightBound
                ) 
            ) {
                canFit = false;
                break;
            }
        }
        if (!canFit) break;
        current -= 1; 
    }
    if (current + 1 === layers.length) {
        layers.push([seg]);
    } else {
        layers[current + 1].push(seg);
    }
};

const parseEngLines = (props, charX, charWidth, charLines) => {

    let str = props.task.context;
    let fontFamily = props.displaySettings.fontFamily;
    let canvasWidth = props.canvasWidth;
    let fontSize = parseInt(props.displaySettings.fontSize);
    if (isNaN(fontSize)) {
        fontSize = 30;
    }
    
    let padding = parseInt(props.displaySettings.padding);
    if (isNaN(padding)) {
        padding = 50;
    }

    let charGap = parseInt(props.displaySettings.charGap);
    if (isNaN(charGap)) {
        charGap = 0;
    }


    let ctx = document.createElement('canvas').getContext('2d');
    ctx.font = fontSize + 'px ' + fontFamily;

    let words = breakIntoWords(str);
    let spaceWidth = Math.ceil(ctx.measureText(' ').width);

    let lineStart = 0;
    let lineEnd = 0;
    let wordPtr = 0;
    let charCount = 0;
    while (lineStart < str.length) {
        let xStart = padding;
        while (lineEnd < str.length && xStart < canvasWidth - padding) {
            let word = words[wordPtr];
            if ( word === ' ') {
                if (xStart + charGap + spaceWidth <= canvasWidth - padding) {
                    charX[charCount] = xStart;  // put space in
                    charWidth[charCount] = spaceWidth;
                } else {
                    // squeeze space in
                    charWidth[charCount] = canvasWidth - padding - charGap - xStart;
                    charX[charCount] = xStart;
                }
                xStart += spaceWidth + charGap;
                wordPtr += 1;
                lineEnd += 1
                charCount += 1;
                continue;
            }

            let wordInfo = getWordInfo(ctx, word, charGap);
            if (
                xStart !== padding && 
                xStart + wordInfo[wordInfo.length - 1][1] > canvasWidth - padding
            ) {
                break;// move to next line
            }
            for (let i = 0; i < word.length; i++) {
                charX[charCount] = xStart + wordInfo[i][0];
                charWidth[charCount] = wordInfo[i][1] - wordInfo[i][0];
                charCount += 1;
            }
            xStart += wordInfo[wordInfo.length - 1][1] + charGap;
            wordPtr += 1;
            lineEnd += word.length;
        } 
        charLines.push([lineStart, lineEnd-1]);
        lineStart = lineEnd;
        lineEnd = lineStart;
    } 
};

const parseNoneEngLines = (props, charX, charWidth, charLines) => {

    let str = props.task.context;
    let fontFamily = props.displaySettings.fontFamily;
    let canvasWidth = props.canvasWidth;
    let fontSize = parseInt(props.displaySettings. fontSize);
    if (isNaN(fontSize)) {
        fontSize = 30;
    }
    
    let padding = parseInt(props.displaySettings.padding);
    if (isNaN(padding)) {
        padding = 50;
    }

    let charGap = parseInt(props.displaySettings.charGap);
    if (isNaN(charGap)) {
        charGap = 0;
    }


    let ctx = document.createElement('canvas').getContext('2d');
    ctx.font = fontSize + 'px ' + fontFamily;
    let lineStart = 0;
    let lineEnd = 0;
    while (lineStart < str.length) {
        let xStart = padding;
        while (lineEnd < str.length) {
            let w = Math.ceil(ctx.measureText(str.charAt(lineEnd)).width);
            if (
                xStart + w + padding <= canvasWidth
            ){
                charX[lineEnd] = xStart;
                charWidth[lineEnd] = w;
                lineEnd += 1;
                xStart += w + charGap;
                continue;
            }
            break;
        } 
        charLines.push([lineStart, lineEnd-1]);
        lineStart = lineEnd;
        lineEnd = lineStart;
    } 
}

const breakIntoWords = (str) => {
    let res = [];
    let ptr = 0;
    let word = '';
    while (ptr < str.length) {
        if (str.charAt(ptr) === ' ') {
            if (word.length !== 0) res.push(word);
            res.push(' ');
            word = '';
        } else {
            word = word + str.charAt(ptr);
        }
        ptr += 1;
    }
    if (word.length !== 0) res.push(word);
    return res;
}

const getWordInfo = (ctx, word, charGap) => {
    let res = Array(word.length);
    let current = 0;
    for (let i = 0; i < word.length; i++) {
        res[i] = [current, current + Math.ceil(ctx.measureText(word.charAt(i)).width)];
        current = res[i][1] + charGap;
    }
    return res;
}

export default getCharLabelPos;
export { parseStrLines };