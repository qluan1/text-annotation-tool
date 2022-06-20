import React, { useEffect } from 'react';

function TagContainers(props) {
    // get invisible container for each labels
    // in order to attach listeners that allow users
    // to interact with individual label
    let initializedLabels = props.initializedLabels;
    let setMouseHoverLabel = props.setMouseHoverLabel;
    let deleteLabel = props.deleteLabel;
    
    let ctx = document.createElement('canvas').getContext('2d');
    ctx.font = props.labelFontSize + 'px ' + props.labelFontFamily;

    let tagCon = [];
    let mouseEnterListeners = [];
    let mouseLeaveListeners = [];
    let mouseClickListeners = [];

    initializedLabels.forEach((l) => {
        
        let width = ctx.measureText(l.tagInfo[0]).width;
        let height = props.labelFontSize;
        let top = (l.tagInfo[2] - height);
        let left = (l.tagInfo[1]);
    
        let conStyle = {}
        conStyle.position = 'absolute';
        conStyle.height = (height+1) + 'px';
        conStyle.width = width + 'px';
        conStyle.top = top + 'px';
        conStyle.left = left + 'px';
        conStyle.zIndex = '2';
        conStyle.cursor = 'pointer';

        tagCon.push((
            <div
                id = {'label-tag-' + l.name + ',' + l.startIndex.toString() + ',' + l.endIndex.toString()}
                key = {'label-tag-' + l.name + ',' + l.startIndex.toString() + ',' + l.endIndex.toString()}
                style = {conStyle}
            >
            </div>
        ));

        mouseEnterListeners.push(() => {
            let hoveredLabel = {};
            hoveredLabel.start = l.startIndex;
            hoveredLabel.end = l.endIndex;
            hoveredLabel.textColor = l.textColor;
            setMouseHoverLabel(hoveredLabel);
        });
        mouseLeaveListeners.push(() => {
            setMouseHoverLabel({start:null, end: null});
        });
        mouseClickListeners.push(() => {
            let dialogProps = {};
            dialogProps.title = 'Do you want to delete this label?';
            let styleText = {};
            styleText.color = 'grey';
            let styleLabel = {};
            styleLabel.color = l.textColor;

            dialogProps.content = (
                <div>
                    <span style = {styleText} >
                        {props.context.substring(l.startIndex, l.endIndex+1)}
                    </span>
                    {" is labeled as "}
                    <span style = {styleLabel}>
                        {l.name}
                    </span>
                </div>
            );
            let tempLabel = {name: l.name, startIndex: l.startIndex, endIndex: l.endIndex};
            dialogProps.onConfirm = deleteLabel.bind(null, tempLabel);
            dialogProps.isActive = true;
            //deleteLabel(l.name, l.start, l.end);
            props.handleScroll();
            props.popConfDial(dialogProps);
        })
    });

    useEffect(() => {
        for (let i = 0; i < initializedLabels.length; i++) {
            let container = document.getElementById(
                'label-tag-' + initializedLabels[i].name + 
                ',' + initializedLabels[i].startIndex.toString() + ',' + initializedLabels[i].endIndex.toString()
            );
            container.addEventListener('mouseenter', mouseEnterListeners[i]);
            container.addEventListener('mouseleave', mouseLeaveListeners[i]);
            container.addEventListener('click', mouseClickListeners[i]);
        }
    }, [])

    return (
        <div>
            {tagCon}
        </div>
    );
}


export default TagContainers;