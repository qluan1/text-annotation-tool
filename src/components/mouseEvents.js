import { getStartEndIndex } from './selection';
import { handleMouseEdgeScroll, handleMouseEdgeScrollOnElement} from './util';
import { getLabelToolPosition } from './LabelTool';
function mouseMove(
    canvasRef,
    charX,
    charY,
    charWidth,
    mouseDownPosRef,
    isMouseDownRef,
    props,
    setSelect,
    timer, 
    e
) {
    if (isMouseDownRef.current === false) {
        return;
    }
    const rect = canvasRef.current.getBoundingClientRect();
    const offsetY = rect.top + window.pageYOffset;
    const offsetX = rect.left + window.pageXOffset;

    let x = Math.round(e.pageX - offsetX);
    let y = Math.round(e.pageY - offsetY);
    let [ss, se] = getStartEndIndex(
        charX,
        charY,
        charWidth,
        x, 
        y, 
        mouseDownPosRef.current.X, 
        mouseDownPosRef.current.Y,
        props.displaySettings.fontSize
    );
    setSelect({start:ss, end:se});
    handleMouseEdgeScroll(e, 3, 15, timer); // scroll when cursor hover viewport edge
    handleMouseEdgeScrollOnElement(e, canvasRef.current.parentNode, 3, 15, timer);
}

function mouseDown(
    setIsMouseDown,
    setSelect,
    canvasRef,
    setMouseDownPos,
    e
) {
    
    if (e.target != canvasRef.current) return;
    setIsMouseDown(true);
    setSelect({start:null, end:null});

    let labelTool = document.querySelector('.label-tool');
    if (labelTool != null) {
        labelTool.classList.remove('active');
    }

    // document.removeEventListener('mousemove', handleMouseMove);
    // document.addEventListener('mousemove', handleMouseMove);
    const rect = canvasRef.current.getBoundingClientRect();
    const offsetY = rect.top + window.pageYOffset;
    const offsetX = rect.left + window.pageXOffset;
    let x = Math.round(e.pageX - offsetX);
    let y = Math.round(e.pageY - offsetY);
    setMouseDownPos({X:x, Y:y});
}

function mouseUp(
    setIsMouseDown,
    charX,
    charY,
    selectRef,
    charWidth,
    props,
    height,
    e
) {
    setIsMouseDown(false);
    let labelTool = document.querySelector('.label-tool');
    if (
        labelTool != null && 
        selectRef.current.start !== null && 
        selectRef.current.end !== null
    ) {
        let [x, y] = [
            charX[selectRef.current.start],
            charY[selectRef.current.start]  
        ];
        let [backupX, backupY] = [
            charX[selectRef.current.end] + charWidth[selectRef.current.end],
            charY[selectRef.current.end]                
        ];
        let [top, left] = getLabelToolPosition(
            props,
            height,
            x, 
            y, 
            backupX, 
            backupY, 
        );
        labelTool.classList.add('active');
        labelTool.style.top = top.toString() + 'px';
        labelTool.style.left = left.toString()+ 'px';
        labelTool.querySelector('input[type="text"]').focus();
    }  
}

export { mouseMove, mouseUp, mouseDown };
