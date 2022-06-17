import React, { useRef, useEffect, useState } from 'react';
import { 
    getPixelRate, initializeHiPPICanvasProps, 
    getViewport, handleMouseEdgeScrollOnElement, 
    useStateRef, handleMouseEdgeScroll 
} from './util';

import { initializeLabels, copyLabels } from './label';
import getCharLabelPos, {parseStrLines} from './getCharLabelPos'
import { drawText, highlight, drawLabel } from './draw';
import { getStartEndIndex } from './selection';
import LabelTool, {getLabelToolPosition} from './LabelTool';
import TagContainers from './TagContainers';
import { mouseMove, mouseUp, mouseDown } from './mouseEvents';

import '../Canvas.css';


const Canvas = (props) => {

    // initialization
    // get the pixel ratio for high resolution monitors
    let PIXEL_RATIO = getPixelRate(); 

    // parse the input string into lines
    // and get the x coordinates for each character
    const [charX, charWidth, charLines] = parseStrLines(props);

    // initialize the passed labels
    let labels = [];
    if (
        props.task !== null &&
        props.task.labels !== undefined
    ) {
        labels = props.task.labels;
    }
    let initializedLabels = copyLabels(labels);

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

    let [vpw, vph] = getViewport();
    const height = Math.max(
        vph,
        charY[charY.length - 1] + props.displaySettings.padding
    );
    

    //let [mousePos, setMousePos] = useState({X:0, Y:0});
    let [isMouseDown, setIsMouseDown, isMouseDownRef] = useStateRef(false);
    let [mouseDownPos, setMouseDownPos, mouseDownPosRef] = useStateRef({X:0, Y:0});
    let [select, setSelect, selectRef] = useStateRef({start:null, end:null});
    let [mouseHoverLabel, setMouseHoverLabel] = useState({start: null, end: null});

    const canvasRef = useRef(null);
    const overlayRef = useRef(null);

    let timer = null; // pointer to timer for handling scrolling event

    const handleMouseMove = mouseMove.bind(
        null, 
        canvasRef, 
        charX, 
        charY, 
        charWidth, 
        mouseDownPosRef, 
        isMouseDownRef, 
        props, 
        setSelect, 
        timer
    );

    const handleMouseDown = mouseDown.bind(
        null,
        setIsMouseDown,
        setSelect,
        canvasRef,
        setMouseDownPos
    );

    const handleMouseUp = mouseUp.bind(
        null,
        setIsMouseDown,
        charX,
        charY,
        selectRef,
        charWidth,
        props,
        height
    );

    // memorizes the sroll position of the canvas-container
    // such that when Canvas element re-render 
    // it stays on the position
    const handleScroll = (e) => {
        let container = document.querySelector('.canvas-container');
        props.setScrollMem({
            left: container.scrollLeft,
            top: container.scrollTop
        });
    }; 

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
        labelObj.startIndex = selectRef.current.start;
        labelObj.endIndex = selectRef.current.end;
        labelObj.textColor = (
            (textColor === undefined)? 
            'RGB(224, 58, 31)': textColor
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

        let ctx = initializeHiPPICanvasProps(
            canvas, 
            props.canvasWidth, 
            height, 
            PIXEL_RATIO
        );

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

        container.scrollTo(props.scrollMem.left, props.scrollMem.top);

        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('scroll', handleScroll);

        return (() => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mouseup', handleMouseUp);
            container.removeEventListener('scroll', handleScroll);
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
                props.displaySettings.fontSize, 
                props.displaySettings.charGap, 
                'rgb(173, 216, 230)'
            );
        } else if (
            mouseHoverLabel.start !== null &&
            mouseHoverLabel.end !== null &&
            mouseHoverLabel.start <= mouseHoverLabel.end
        ) {
            let highlightColor = 'rgb(173, 216, 230)';
            if (
                mouseHoverLabel.textColor !== undefined
            ){
                highlightColor = mouseHoverLabel.textColor;
            }
            highlight(
                overlayCtx, 
                charX, 
                charY,
                charWidth,
                mouseHoverLabel.start, 
                mouseHoverLabel.end, 
                props.displaySettings.fontSize, 
                props.displaySettings.charGap, 
                highlightColor
            );            
        }

    }, [        
        select,
        mouseHoverLabel
    ]);


    return (
        <div className="content" style = {{width : props.canvasWidth.toString() + 'px'}}>
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
                <TagContainers
                    context = {(props.task === null)? '': props.task.context}
                    labelFontSize = {props.displaySettings.labelFontSize}
                    labelFontFamily = {props.displaySettings.labelFontFamily}
                    initializedLabels = {initializedLabels}
                    setMouseHoverLabel = {setMouseHoverLabel}
                    deleteLabel = {props.deleteLabel}
                    popConfDial = {props.popConfDial}
                />
                <LabelTool
                    templates = {(props.labelTemplates === undefined)?[]:props.labelTemplates} 
                    addLabel = {addLabel}
                    removeLabelTool = {removeLabelTool}
                />
            </div>
        </div>
    );
}

export default Canvas;