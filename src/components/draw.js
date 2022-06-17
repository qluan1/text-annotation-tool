function highlight(
    context, 
    charX, 
    charY,
    charWidth,
    start, 
    end, 
    fontSize, 
    charGap, 
    color
) {
    if (!(start !== null && end!== null && start <= end)) {
        return;
    }
    for (let i = start; i <= end; i++) {
        let x = charX[i];
        let y = charY[i] - fontSize + 2;
        let l = charWidth[i] + charGap;
        let w = fontSize;
        context.fillStyle = 'rgba(255, 0, 0, 0.1)';
        if (color !== undefined) {
            context.fillStyle = color;
        }
        context.fillRect(x, y, l, w);
        context.fillStyle = 'rgb(0, 0, 0)';
    }
}

function drawText(
    context,
    props,
    charX,
    charY,
) {
    if (
        props.task.context === undefined || 
        typeof(props.task.context) != typeof('string') || 
        props.task.context.length === 0
    ) {
        return;
    }
    context.font = props.displaySettings.fontSize + 'px ' + props.displaySettings.fontFamily;
    context.fillStyle = 'rgb(0, 0, 0)';
    for (let i = 0; i < props.task.context.length; i++) {
        context.fillText(props.task.context.charAt(i), charX[i], charY[i]);
    }
}


function drawLabel(
    context,
    instructions,
    props
) {
    context.font = props.displaySettings.labelFontSize + 'px ' + props.displaySettings.labelFontFamily;
    for (let l of instructions ) {
        let xStart = l[0];
        let yStart = l[1];
        let xEnd = l[2];
        let textColor = l[3];
        context.beginPath();
        context.moveTo(xStart, yStart);
        context.lineTo(xEnd, yStart);
        context.lineWidth = 2;
        context.strokeStyle = (
            (textColor === undefined)?
            'rgb(0, 0, 0)' : 
            textColor
        );
        context.stroke();
        context.closePath();
        if (l.length === 7) {
            context.fillStyle = (
                (textColor === undefined)?
                'rgb(0, 0, 0)' : 
                textColor
            );
            context.fillText(l[4], l[5], l[6]);
        }
    }
}

export {
    drawText,
    highlight,
    drawLabel
};