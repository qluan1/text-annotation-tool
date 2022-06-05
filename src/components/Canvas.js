import React, { useRef, useEffect, useState } from 'react';
import { 
    getPixelRate, initializeHiPPICanvasProps, 
    getViewport, handleMouseEdgeScroll, 
    useStateRef 
} from './util';
import { initializeLabels, copyLabels, getLabelTagContainer } from './label';
import getCharLabelPos, {parseStrLines} from './getCharLabelPos'
import { drawText, highlight, drawLabel } from './draw';
import { getStartEndIndex } from './selection';
import LabelTool, {getLabelToolPosition} from './LabelTool';

import '../Canvas.css';

const Canvas = (props) => {

    // initialization

    // get the pixel ratio for high resolution monitors
    let PIXEL_RATIO = getPixelRate(); 

    // parse the input string into lines
    // and get the x coordinates for each character
    const [charX, charWidth, charLines] = parseStrLines(props);
    // initialize the passed labels
    let initializedLabels = copyLabels(props.labels);

    initializeLabels(
        props,
        initializedLabels,
        charX,
        charWidth,
        charLines
    );

    // get the initial y coordinates for each character
    // and label tags
    const [charY, labelDrawInstruction] = getCharLabelPos(
        props,
        charX,
        charWidth,
        charLines,
        initializedLabels,
    );

    const height = charY[charY.length - 1] + props.padding;


    let [mousePos, setMousePos] = useState({X:0, Y:0});
    let [isMouseDown, setIsMouseDown] = useState(false);
    let [mouseDownPos, setMouseDownPos, mouseDownPosRef] = useStateRef({X:0, Y:0});
    let [select, setSelect, selectRef] = useStateRef({start:null, end:null});
    let [mouseHoverLabel, setMouseHoverLabel] = useState({start: null, end: null});

    const canvasRef = useRef(null);
    const overlayRef = useRef(null);

    let timer = null; // pointer to timer for handling scrolling event

    const handleMouseMove = (e) => {
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
            props.fontSize
        );
        setSelect({start:ss, end:se});
        setMousePos({X:x, Y:y});
        handleMouseEdgeScroll(e, 3, 15, timer); // scroll when cursor hover viewport edge
    };

    const handleMouseDown = (e) => {
        if (e.target != canvasRef.current) return;
        setIsMouseDown(true);
        setSelect({start:null, end:null});

        let labelTool = document.querySelector('.label-tool');
        if (labelTool != null) {
            labelTool.classList.remove('active');
        }

        document.removeEventListener('mousemove', handleMouseMove);
        document.addEventListener('mousemove', handleMouseMove);
        const rect = canvasRef.current.getBoundingClientRect();
        const offsetY = rect.top + window.pageYOffset;
        const offsetX = rect.left + window.pageXOffset;
        let x = Math.round(e.pageX - offsetX);
        let y = Math.round(e.pageY - offsetY);
        setMouseDownPos({X:x, Y:y});
        setMousePos({X:x, Y:y});
    }

    const handleMouseUp = (e) => {
        setIsMouseDown(false);
        document.removeEventListener('mousemove', handleMouseMove);
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

    const addLabel = (labelName, textColor) => {
        if (
            !(
                selectRef.current.start !== null && 
                selectRef.current.end !== null && 
                selectRef.current.start <= selectRef.current.end
            )
        ) {
            return false;
        }

        let labelObj = {};
        labelObj.name = labelName;
        labelObj.start = selectRef.current.start;
        labelObj.end = selectRef.current.end;
        labelObj.textColor = (
            (textColor === undefined)? 
            'rgb(125, 125, 125)': textColor
        );

        return props.addLabel(labelObj);
    }

    const removeLabelTool = () => {
        setSelect({start:null, end:null});
        let labelTool = document.querySelector('.label-tool');
        if (labelTool != null) {
            labelTool.classList.remove('active');
            labelTool.querySelector('input[type="text"]').value = '';
        }
    }

    // initialize the canvas with text and labels
    // set up eventlisteners for user interaction
    useEffect(() => {
        let canvas = canvasRef.current;
        let container = canvas.parentNode;
        container.style.width = props.canvasWidth + 'px';
        container.style.height = height + 'px';
        container.style.background = '#f7f4ef';
        let ctx = initializeHiPPICanvasProps(
            canvas, 
            props.canvasWidth, 
            height, 
            PIXEL_RATIO
        );

        // get invisible container for each labels
        // in order to attach listeners that allow users
        // to interact with individual label
        initializedLabels.forEach((l) => {
            let tagCon = getLabelTagContainer(l, ctx, props);
            tagCon.addEventListener('mouseenter', () => {
                let hoveredLabel = {};
                hoveredLabel.start = l.start;
                hoveredLabel.end = l.end;
                hoveredLabel.textColor = l.textColor;
                setMouseHoverLabel(hoveredLabel);
            })
            tagCon.addEventListener('mouseleave', () => {
                setMouseHoverLabel({start:null, end: null});
            })
            container.appendChild(tagCon);
        });

        ctx.clearRect(0, 0, props.canvasWidth, height);
        drawLabel(
            ctx,
            labelDrawInstruction,
            props
        );

        drawText(
            ctx,
            props,
            charX,
            charY
        );
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);

        return (() => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mouseup', handleMouseUp);
        });
    }, []);


    // highlight active selection 
    // or mouse-hovering label
    useEffect(() => {
        let overlay = overlayRef.current;
        let overlayCtx = initializeHiPPICanvasProps(
            overlay, 
            props.canvasWidth, 
            height, 
            PIXEL_RATIO
        );
        overlayCtx.clearRect(0, 0, props.canvasWidth, height);
        if (
            select.start !== null && 
            select.end !== null &&
            select.start <= select.end
        ){
            highlight(
                overlayCtx, 
                charX, 
                charY,
                charWidth,
                select.start, 
                select.end, 
                props.fontSize, 
                props.charGap, 
                'rgba(173, 216, 230, 0.8)'
            );
        } else if (
            mouseHoverLabel.start !== null &&
            mouseHoverLabel.end !== null &&
            mouseHoverLabel.start <= mouseHoverLabel.end
        ) {
            let highlightColor = undefined;
            let colorIndexStart = mouseHoverLabel.textColor.indexOf('(');
            let colorIndexEnd = mouseHoverLabel.textColor.indexOf(')');
            if (
                mouseHoverLabel.textColor !== undefined &&
                colorIndexStart !== -1 &&
                colorIndexEnd !== -1
            ){
                highlightColor = (
                    'RGBA' +
                    mouseHoverLabel.textColor.substring(
                        colorIndexStart,
                        colorIndexEnd
                    ) + 
                    ', 0.5)'
                );
            }
            highlight(
                overlayCtx, 
                charX, 
                charY,
                charWidth,
                mouseHoverLabel.start, 
                mouseHoverLabel.end, 
                props.fontSize, 
                props.charGap, 
                highlightColor
            );            
        }

    }, [        
        select,
        mouseHoverLabel
    ]);


    return (
        <div>
            <div className = "canvas-container">
                <canvas 
                    ref={canvasRef}
                    style= {{
                        position: 'absolute',
                        top: '0px',
                        left: '0px',
                        zIndex:  '1'
                    }}  
                />
                <canvas 
                    ref={overlayRef}
                    style= {{
                        position: 'absolute',
                        top: '0px',
                        left: '0px',
                        zIndex: '0'
                    }}    
                />
                <LabelTool
                    templates = {props.labelTemplates} 
                    addLabel = {addLabel}
                    removeLabelTool = {removeLabelTool}
                />
            </div>
        </div>
    );
}

export default Canvas;