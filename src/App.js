// 'RGB(224, 58, 31)',
// 'RGB(225, 128, 1)',
// 'RGB(255, 200, 37)',
// 'RGB(145, 179, 77)',
// 'RGB(77, 179, 77)',
// 'RGB(52, 204, 152)',
// 'RGB(52, 153, 203)',
// 'RGB(51, 51, 204)',
// 'RGB(112, 52, 203)',
// 'RGB(153, 51, 204)',
// 'RGB(204, 50, 152)'

import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom/client';
import Canvas from './components/Canvas';
import './App.css';
import Sidebar from './components/Sidebar';
import { getViewport, useStateRef } from './components/util';
import ConfirmDialog from './components/ConfirmDialog';
import { combineContextLabel } from './components/writeToFile';
import { 
    getDataFromFile, 
    addLabel, 
    deleteLabel, 
    getTaskByIndex, 
    getTaskTotal, 
    outputDataStr
} from './components/data';

const defaultDisplaySettings = {
    fontSize: 30,
    fontFamily: 'Sans-serif',
    padding: 100,
    charGap: 0,
    lineGap: 20,
    labelFontSize: 15,
    labelFontFamily: 'Verdana',
    labelGap: 6
};

const sidebarWidth = 350;

function App () {
    // Html Element Related Variables and Functions
    let [vpw, vph] = getViewport();

    let [canvasWidth, setCanvasWidth] = useState(
        (vpw >=1000)?
        vpw-sidebarWidth:
        Math.max(vpw, 600)
    );
    let [displaySettings, setDisplaySettings] = useState(defaultDisplaySettings);
    let [scrollMem, setScrollMem] = useState({left: 0, top: 0});
    let [confDialProps, setConfDialProps] = useState({isActive: false});
    let [drawState, setDrawState, drawStateRef] = useStateRef(true);
    let [data, setData, dataRef] = useStateRef({error: 'No Data Uploaded'});
    let [currentTaskIndex, setCurrentTaskIndex] = useState(null);
    
    const goToTaskByIndex = (i) => {
        if (
            i >= 0 &&
            i < getTaskTotal(dataRef.current)
        ) {
            setCurrentTaskIndex(i);
            setDrawState(!drawStateRef.current);
        }
    };

    const addLabelToTaskByIndex = (i, label) => {
        let d = dataRef.current;
        addLabel(d, i, label);
        setData(d);
        setDrawState(!drawStateRef.current);
    };

    const deleteLabelFromTaskByIndex = (i, label) => {
        let d = dataRef.current;
        deleteLabel(d, i, label);
        setData(d);
        setDrawState(!drawStateRef.current);
    };

    const handleWindowResize = () => {
        let [vpw, vph] = getViewport();
        if (vpw >= 1000) {
            setCanvasWidth(vpw - 300);
        } else {
            setCanvasWidth(Math.max(vpw, 600));
        }
        setDrawState(!drawStateRef.current);
    }

    const loadData = getDataFromFile.bind(
        null, 
        setData, 
        setCurrentTaskIndex, 
        drawStateRef, 
        setDrawState
    );

    const outputData = ()=> {
        return outputDataStr(dataRef.current);
    };

    useEffect(() => {
        window.addEventListener('resize', handleWindowResize);
        return (
            () => {
                window.removeEventListener('resize', handleWindowResize);
            }
        );
    }, []);

    return (
        <div 
            id="App" 
            key = {drawState}
        >
            <div 
                className= "menu-toggle" 
                onClick = {() => {
                    document.querySelector('.menu-toggle').classList.toggle('is-active');
                    document.querySelector('.sidebar').classList.toggle('is-active');
                }}
            >
                <div className ="hamburger">
                    <span></span>
                </div>
            </div>
            <Sidebar 
                taskTotal = {getTaskTotal(dataRef.current)}
                currentTaskIndex = {currentTaskIndex}
                goToTaskByIndex = {goToTaskByIndex}
                displayProps = {displaySettings}
                setDisplaySettings = {(newDisplaySettings) => {
                    setDisplaySettings(newDisplaySettings);
                    setDrawState(!drawStateRef.current);
                }}
                loadData = {loadData}
                getOutputData = {outputData}
                sidebarWidth = {sidebarWidth}
            />

            <Canvas 
                taskIndex = {currentTaskIndex}
                task = {getTaskByIndex(dataRef.current, currentTaskIndex)}
                canvasWidth = {canvasWidth}
                displaySettings = {displaySettings}
                labelTemplates = {(
                    (dataRef.current.labelTemplates === undefined)?
                    []:
                    dataRef.current.labelTemplates
                )}
                scrollMem = {scrollMem}
                setScrollMem = {setScrollMem}
                addLabel = {addLabelToTaskByIndex.bind(null, currentTaskIndex)}
                deleteLabel = {deleteLabelFromTaskByIndex.bind(null, currentTaskIndex)}
                popConfDial = { (p) => {
                    setConfDialProps(p);
                    setDrawState(!drawStateRef.current);
                }}
            />

            <ConfirmDialog
                title = {confDialProps.title}
                content = {confDialProps.content}
                onConfirm = {confDialProps.onConfirm}
                isActive = {confDialProps.isActive}
                setConfDialProps = {(p) => {
                    setConfDialProps(p);
                    setDrawState(!drawStateRef.current);
                }}
            />
        </div>
    );
}

export default App;