import React, {useState, useEffect, useRef} from 'react';
import '../Sidebar.css';

function Sidebar (props) {

    let goToPrev = props.goToTaskById.bind(null, props.currentTaskId - 1);
    let goToNext = props.goToTaskById.bind(null, props.currentTaskId + 1);

    return (
        <aside className = "sidebar" style = {props.sidebarStyle}>
            <div className = "sidebar-title">Text-Annotation-Tool</div>

            <div className = "nav-task">
                <p>{'Task #:'}</p>
                <p>
                    {`${props.currentTaskId+1} of ${props.totalTaskNumber}`}
                </p>
                <div className = "nav-task-buttons">
                    <button onClick = {goToPrev}>
                        Prev
                    </button>
                    <button onClick = {goToNext}>
                        Next
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;