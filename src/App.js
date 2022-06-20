import React, {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom/client';
import Canvas from './components/Canvas';
import './App.css';
import Sidebar from './components/Sidebar';
import { getViewport, useStateRef, popAlert } from './components/util';
import ConfirmDialog from './components/ConfirmDialog';
import { combineContextLabel } from './components/writeToFile';
import { 
    parseData,
    getDataFromFile, 
    addLabel, 
    deleteLabel, 
    getTaskByIndex, 
    getTaskTotal, 
    outputDataStr
} from './components/data';
import sampleInput from '../examples/sampleInputFile.json';

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

const initialData =   (function (){
    let initialData;
    try {
        initialData = parseData(sampleInput);
    } catch (e) {
        console.log(e);
        console.log('sample data is not loaded.');
        initialData = {error: 'No Data Uploaded'};
    }
    return initialData;
})();

function App () {
    // Html Element Related Variables and Functions
    let [vpw, vph] = getViewport();

    // hooks
    let [canvasWidth, setCanvasWidth] = useState(
        (vpw >=1000)?
        vpw-sidebarWidth:
        Math.max(vpw, 600)
    );
    let [displaySettings, setDisplaySettings] = useState(defaultDisplaySettings);
    let [scrollMem, setScrollMem] = useState({left: 0, top: 0});
    let [confDialProps, setConfDialProps] = useState({isActive: false});
    let [drawState, setDrawState, drawStateRef] = useStateRef(true);
    let dataRef = useRef(initialData);
    let [currentTaskIndex, setCurrentTaskIndex] = useState(0);

    // function to navigate between tasks
    const goToTaskByIndex = (i) => {
        if (
            i >= 0 &&
            i < getTaskTotal(dataRef.current) &&
            i !== currentTaskIndex
        ) {
            handleScroll();
            setCurrentTaskIndex(i);
            setDrawState(!drawStateRef.current);
        }
    };

    const addLabelToTaskByIndex = (i, label) => {
        let d = dataRef.current;

        let message = addLabel(d, i, label);
        if (message !== null) {
            popAlert('CANNOT ADD LABEL', message);
        }
        
        handleScroll();
        setDrawState(!drawStateRef.current);
        return message === null;
    };

    const deleteLabelFromTaskByIndex = (i, label) => {
        let d = dataRef.current;

        let message = deleteLabel(d, i, label);
        if (message !== null) {
            popAlert('CANNOT DELETE LABEL', message);
        }

        handleScroll();
        setDrawState(!drawStateRef.current);
        return message === null;
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

    // memorizes the sroll position of the canvas-container
    // such that when Canvas element re-render 
    // it stays on the position
    const handleScroll = (e) => {
        let container = document.querySelector('.canvas-container');
        if (container !== null) {
            setScrollMem({
                left: container.scrollLeft,
                top: container.scrollTop
            });
        }
    };

    const loadData = getDataFromFile.bind(
        null, 
        dataRef, 
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
                handleScroll = {handleScroll}
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