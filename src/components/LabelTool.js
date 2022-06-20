import React, {useEffect, useRef, useState} from 'react';

function LabelTool(props) {

    const labelToolRef = useRef(null);
    const inputRef = useRef(null);

    const maxHeight = 400;
    const toolWidth = 200;
    let [userFilter, setUserFilter] = useState('');
    
    const handleAdd = (name, color, e) => {
        if (props.addLabel(name, color)) {
            props.removeLabelTool();
        }
    };

    useEffect(() => {
        for (let i = 0; i < props.templates.length; i++) {
            let t = props.templates[i];
            let q = '#label-option-' + t.name;
            document.querySelector(q).style.display = 'flex';    
        }
        if (
            userFilter === null ||
            userFilter === undefined ||
            userFilter === ''
        ) {
            return;
        }
        for (let i = 0; i < props.templates.length; i++) {
            let t = props.templates[i];
            if (t.name.toUpperCase().indexOf(userFilter.toUpperCase()) === -1){
                let q = '#label-option-' + t.name;
                document.querySelector(q).style.display = 'none';    
            }
        }
    }, [userFilter]);

    let dimension  = {};
    dimension.height = Math.min(maxHeight, 52 + 30*props.templates.length) + 'px';
    dimension.width = toolWidth + 'px';


    return (
        <div 
            className="label-tool" 
            ref = {labelToolRef}
            style = {dimension}
        >
            <input 
                type="text" 
                ref = {inputRef}
                placeholder = "Select..."
                value = {userFilter}
                onChange = {
                    () => {
                        setUserFilter(inputRef.current.value);
                    }
                }
            />
            <div className="label-buttons">
                {props.templates.map( (t) => {
                    return templateToButton(t, handleAdd.bind(null, t.name, t.textColor));
                })}
            </div>
        </div>
    );
}


//   label tool
//   (x, y) anchor point

function getLabelToolPosition(
    props,
    height, 
    x, 
    y, 
    backupX, 
    backupY
) {
    const maxHeight = 400;
    let toolHeight = Math.min(maxHeight, 52 + 30*props.labelTemplates.length);
    const toolWidth = 200;
    let top;
    let left;
    if (x + toolWidth < props.canvasWidth - props.displaySettings.padding) {
        left = x;
        top = y - props.displaySettings.fontSize - toolHeight;
        if (top < 0 + props.displaySettings.padding) {
            top = y;
        }
    } else {
        left = backupX - toolWidth;
        if (left < 0 + props.displaySettings.padding) {
            left = props.displaySettings.padding;
        }
        top = backupY;
        if (top + toolHeight > height - props.displaySettings.padding) {
            top = y - props.displaySettings.fontSize - toolHeight;
        }
    }
    return [top, left];
}

const templateToButton = (t, clickHandler) => {
    let bgc = {};
    bgc.backgroundColor = (
        (t.textColor === undefined)? 
        'rgb(125, 125, 125)': t.textColor
    );
    return (
        <div 
            className = 'label-option' 
            id = {'label-option-'+t.name}
            key = {t.name}
            onClick = {clickHandler}
        >
            <div className = 'label-option-color' style = {bgc}></div>
            <div className = 'label-option-name'>
                {t.name}
            </div>
        </div>
    );
}


export default LabelTool;
export {getLabelToolPosition};