import React, {useEffect, useRef, useState} from 'react';

const templateToButton = (t) => {
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
        >
            <div className = 'label-option-color' style = {bgc}></div>
            <div className = 'label-option-name'>
                {t.name}
            </div>
        </div>
    );
}

function LabelTool(props) {

    const labelToolRef = useRef(null);
    const inputRef = useRef(null);

    const maxHeight = 400;
    const toolWidth = 200;
    let [userFilter, setUserFilter] = useState('');
    
    const handleAdd = (name, color) => {
        if (props.addLabel(name, color)) {
            props.removeLabelTool();
        }
    };

    useEffect( () => {
        let listeners = [];
        for (let i = 0; i < props.templates.length; i++) {
            let t = props.templates[i];
            let q = '#label-option-' + t.name;
            let listener = handleAdd.bind(null, t.name, t.textColor);
            listeners.push(listener);
            document.querySelector(q).addEventListener('click', listener);      
        }
        return (() => {
            for (let i = 0; i < props.templates.length; i++) {
                let t = props.templates[i];
                let q = '#label-option-' + t.name;
                let ele = document.querySelector(q);
                if (ele !== null) {
                    removeEventListener('click', listeners[i]);
                }    
            }            
        });
    }, []);

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
                {props.templates.map(templateToButton)}
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
    if (x + toolWidth < props.canvasWidth - props.padding) {
        left = x;
        top = y - props.fontSize - toolHeight;
        if (top < 0 + props.padding) {
            top = y;
        }
    } else {
        left = backupX - toolWidth;
        if (left < 0 + props.padding) {
            left = props.padding;
        }
        top = backupY;
        if (top + toolHeight > height - props.padding) {
            top = y - props.fontSize - toolHeight;
        }
    }
    return [top, left];
}



export default LabelTool;
export {getLabelToolPosition};