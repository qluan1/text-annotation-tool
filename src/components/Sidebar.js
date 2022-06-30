import React, {useState, useEffect, useRef} from 'react';
import '../Sidebar.css';
import {copyDisplaySettings} from './util';
import { createFileAndGetURL } from './writeToFile';
import addFileIcon from '../assets/icons/uploadFile.svg'
import downloadIcon from '../assets/icons/download.svg'
//import prepFileIcon from '../assets/icons/prepFile.svg'

function Sidebar (props) {

    const inputTaskNumberRef = useRef(null);
    const selectFontSizeRef = useRef(null);
    const selectFontFamilyRef = useRef(null);
    const getFileLinkRef = useRef(null);
    const downloadLinkRef = useRef(null);

    let totalTaskNumber = props.taskTotal;
    let [inputTask, setInputTask] = useState(
        (props.currentTaskIndex === null)?
        0:props.currentTaskIndex+1
    );

    let goToPrev = props.goToTaskByIndex.bind(null, props.currentTaskIndex - 1);
    let goToNext = props.goToTaskByIndex.bind(null, props.currentTaskIndex + 1);
    let goToInput = () => {
        let num = parseInt(inputTaskNumberRef.current.value);
        if (
            isNaN(num) ||
            num <= 0 ||
            num > totalTaskNumber
        ) {
            alert('Invalid Task Number!');
            return;
        }
        props.goToTaskByIndex(num-1);
    }

    let setFontSize = () => {
        let newDisplaySettings = copyDisplaySettings(props.displayProps);
        newDisplaySettings.fontSize = parseInt(selectFontSizeRef.current.value);
        props.setDisplaySettings(newDisplaySettings);
    };

    let setFontFamily = () => {
        let newDisplaySettings = copyDisplaySettings(props.displayProps);
        newDisplaySettings.fontFamily = selectFontFamilyRef.current.value;
        props.setDisplaySettings(newDisplaySettings);
    }

    return (
        <aside className = "sidebar" style = {{width: props.sidebarWidth}}>
            <div className = "sidebar-title">Text-Annotation-Tool</div>

            <div className = "sidebar-category-title">
                File Input Output
            </div>

            <div className = "category-inoutput">
                <label 
                        htmlFor='input-data-file' 
                        className = 'file-inoutput-label'
                >
                        <img src = {addFileIcon} alt = "Upload"/>
                        <span>Upload</span>
                        <input 
                            id="input-data-file" 
                            type = "file"
                            style = {{display: 'none'}}
                            onChange = {() => {
                                props.loadData(document.getElementById('input-data-file'));
                            }}
                        />
                </label>

                
                <div
                    ref = {getFileLinkRef}
                    id = "get-file-button"
                    className =  "file-inoutput-label"
                    onClick={ () => {
                        // pop a confirmation window for download
                        let stream = props.getOutputData();
                        if (stream === null) {
                            return;
                        }
                        let url = null;
                        url = createFileAndGetURL(stream, url);
                        let downloadProps = {};
                        downloadProps.title = 'Download File'
                        downloadProps.content = (
                            <label>
                                File Name:
                                <input 
                                    id = 'download-file-name-input'
                                    type = 'text'
                                    placeholder= 'annotation.json'
                                    autoFocus = {true}
                                    style = {{marginLeft: '15px'}}
                                >
                                </input>
                            </label>
                        );
                        downloadProps.isActive = true;
                        downloadProps.onConfirm = () => {
                            let fileName = 'annotation.json';
                            let inputElement = document.getElementById('download-file-name-input');
                            if (inputElement !== null) {
                                const fileNameReg = /^[a-zA-Z0-9](?:[a-zA-Z0-9 ._-]*[a-zA-Z0-9])?\.[a-zA-Z0-9_-]+$/;
                                const ok = fileNameReg.exec(inputElement.value);
                                if (!ok) {
                                    console.log('input filename is NOT valid, using "annotation.json" instead.');
                                } else {
                                    fileName = inputElement.value.trim();
                                }
                            }
                            let b = document.createElement('a');
                            b.href = url;
                            b.download = fileName; 
                            b.style.visibility = 'hidden';
                            document.body.appendChild(b);
                            b.click();
                            document.body.removeChild(b);
                        };
                        props.popConfDial(downloadProps);
                        setTimeout(
                            () => {
                                let inputElement = document.getElementById('download-file-name-input');
                                if (inputElement !== null) {
                                    inputElement.focus();
                                }
                            },
                            250
                        );
                    }}
                >
                    <img src = {downloadIcon} alt = "Download"/>
                    <span>Download</span>   
                </div>


                {/* <a 
                    download = {'annotated.json'}
                    ref = {downloadLinkRef}
                    className = "file-inoutput-label"
                    style = {{display: 'none'}}
                    onClick = { () => {
                        downloadLinkRef.current.style.display = 'none';
                        getFileLinkRef.current.style.display = 'flex';                       
                    }}
                >
                    <img src = {downloadIcon} alt ="Download"/>
                    <span>Download</span>
                </a> */}



            </div>

            <div className = "sidebar-category-title">
                Task Navigation
            </div>

            <div className = "nav-task">
                <div>
                    <span>
                        {
                            'Task: ' +
                            (props.currentTaskIndex+1).toString() +
                            ' of ' +
                            totalTaskNumber.toString()
                        }
                    </span>
                </div>
                <div className = "nav-task-buttons">                    
                    <button id = "prev-task-button" onClick = {goToPrev}>
                        Prev
                    </button>
                    <button id = "next-task-button" onClick = {goToNext}>
                        Next
                    </button>
                </div>
                <div>
                    <span>
                        {'Jump to task: '}
                    </span>
                </div>
                <div>
                    <input 
                        ref = {inputTaskNumberRef}
                        type = "text"
                        value = {inputTask}
                        onChange = {() => {
                            setInputTask(inputTaskNumberRef.current.value);
                        }}
                    ></input>
                    <button id = "goto-task-button" onClick= {goToInput}>
                        Go
                    </button>
                </div>

            </div>


            <div className = "sidebar-category-title">
                Display Settings
            </div>
            <div className = "nav-display-options">
                <label htmlFor = "context-font-size">
                    Font Size:
                </label>

                <select 
                    name = "context-font-size" 
                    id = "context-font-size" 
                    ref = {selectFontSizeRef}
                    onChange = {setFontSize}
                    value = {props.displayProps.fontSize.toString()}
                >
                    <option value = "20">20px</option>
                    <option value = "25">25px</option>
                    <option value = "30">30px</option>
                    <option value = "35">35px</option>
                    <option value = "40">40px</option>
                    <option value = "45">45px</option>
                </select>

                <label htmlFor = "context-font-family">
                    Font Family:
                </label>

                <select 
                    name = "context-font-family" 
                    id = "context-font-family" 
                    ref = {selectFontFamilyRef}
                    onChange = {setFontFamily}
                    value = {props.displayProps.fontFamily}
                >
                    <option value = "Arial">{"Arial"}</option>
                    <option value = "Courier">{"Courier"}</option>
                    <option value = "Sans-serif">{"Sans-serif"}</option>
                    <option value = "Times New Roman">{"Times New Roman"}</option>
                    <option value = "Verdana">{"Verdana"}</option>
                </select>
            </div>




        </aside>
    );
}

export default Sidebar;