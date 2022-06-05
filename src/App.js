import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom/client';
import Canvas from './components/Canvas';
import './App.css';
import Sidebar from './components/Sidebar';
import { getViewport, useStateRef } from './components/util';


const texts = [
    (
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
        'Etiam elementum placerat orci, vitae molestie turpis dapibus in. ' +
        'Vestibulum vel hendrerit lorem, non eleifend ex. ' +
        'Donec consequat cursus sodales. Integer in sagittis sapien. ' +
        'Mauris pretium vel lectus ac laoreet. Maecenas posuere lacinia feugiat. ' +
        'Duis lacus mauris, venenatis in lectus non, egestas facilisis odio. ' + 
        'Praesent non nunc nisi. Phasellus bibendum, ex eget suscipit interdum, ' + 
        'tortor nibh vehicula dolor, eget suscipit velit felis id ligula. ' +
        'Phasellus imperdiet commodo lectus, ac rutrum ex sollicitudin et. ' +
        'Donec tempus tristique ligula eu iaculis. In mollis ullamcorper erat, ' + 
        'ut convallis dui ornare in.' +
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
        'Etiam elementum placerat orci, vitae molestie turpis dapibus in. ' +
        'Vestibulum vel hendrerit lorem, non eleifend ex. ' +
        'Donec consequat cursus sodales. Integer in sagittis sapien. ' +
        'Mauris pretium vel lectus ac laoreet. Maecenas posuere lacinia feugiat. ' +
        'Duis lacus mauris, venenatis in lectus non, egestas facilisis odio. ' + 
        'Praesent non nunc nisi. Phasellus bibendum, ex eget suscipit interdum, ' + 
        'tortor nibh vehicula dolor, eget suscipit velit felis id ligula. ' +
        'Phasellus imperdiet commodo lectus, ac rutrum ex sollicitudin et. ' +
        'Donec tempus tristique ligula eu iaculis. In mollis ullamcorper erat, ' + 
        'ut convallis dui ornare in.' +
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
        'Etiam elementum placerat orci, vitae molestie turpis dapibus in. ' +
        'Vestibulum vel hendrerit lorem, non eleifend ex. ' +
        'Donec consequat cursus sodales. Integer in sagittis sapien. ' +
        'Mauris pretium vel lectus ac laoreet. Maecenas posuere lacinia feugiat. ' +
        'Duis lacus mauris, venenatis in lectus non, egestas facilisis odio. ' + 
        'Praesent non nunc nisi. Phasellus bibendum, ex eget suscipit interdum, ' + 
        'tortor nibh vehicula dolor, eget suscipit velit felis id ligula. ' +
        'Phasellus imperdiet commodo lectus, ac rutrum ex sollicitudin et. ' +
        'Donec tempus tristique ligula eu iaculis. In mollis ullamcorper erat, ' + 
        'ut convallis dui ornare in.'
    ),
    (
        '黄蓉正要将鸡撕开，身后忽然有人说道：“撕作三份，鸡屁股给我。”两人都吃了一惊，' + 
        '怎地背后有人掩来，竟然毫无知觉，急忙回头，只见说话的是个中年乞丐。这人一张长方脸，' + 
        '颏下微须，粗手大脚，身上衣服东一块西一块的打满了补钉，却洗得干干净净，' + 
        '手里拿着一根绿竹杖，莹碧如玉，背上负着个朱红漆的大葫芦，脸上一副馋涎欲滴的模样，' +
        '神情猴急，似乎若不将鸡屁股给他，就要伸手抢夺了。郭、黄两人尚未回答，' +
        '他已大马金刀的坐在对面，取过背上葫芦，拔开塞子，酒香四溢。他骨嘟骨嘟的喝了几口，' +
        '把葫芦递给郭靖，道：“娃娃，你喝。”郭靖心想此人好生无礼，但见他行动奇特，心知有异，' +
        '不敢怠慢，说道：“我不喝酒，您老人家喝罢。”言下甚是恭谨。那乞丐向黄蓉道：' + 
        '“女娃娃，你喝不喝？”'
    )
];

let labels = Array(texts.length);
for (let i = 0; i < texts.length; i++) {
    labels[i] = [];
}

let colorOptions = [
    'RGB(224, 58, 31)',
    'RGB(225, 128, 1)',
    'RGB(255, 200, 37)',
    'RGB(145, 179, 77)',
    'RGB(77, 179, 77)',
    'RGB(52, 204, 152)',
    'RGB(52, 153, 203)',
    'RGB(51, 51, 204)',
    'RGB(112, 52, 203)',
    'RGB(153, 51, 204)',
    'RGB(204, 50, 152)'
];

let labelTemplates = [
    {
        name: 'SPEAKER',
        textColor: 'RGB(224, 58, 31)'
    },
    {
        name: 'GENDER',
        textColor: 'RGB(255, 200, 37)'
    },
    {
        name: 'AGE',
        textColor: 'RGB(51, 51, 204)'
    }
];

const getTaskTotal = () => texts.length;

const getTextById = (id) => {
    return (
        texts[
            Math.max(
                0,
                Math.min(texts.length-1, id)
    )]);
}
const getLabelById = (id) => {
    return (
        labels[
            Math.max(
                0,
                Math.min(texts.length-1, id)
    )]);
}

const canAddLabel = (label, labelArray) => {
    for (let l of labelArray) {
        if (
            label.name === l.name &&
            label.start === l.start &&
            label.end === l.end
        ) {
            return false;
        }
    }
    return true;
};



function App () {

    // Html Element Related Variables and Functions
    let canvasWidth = 1000;
    let sidebarWidth = 300;
    let [vpw, vph] = getViewport();
    let contentWidth = Math.max(canvasWidth, vpw - sidebarWidth);

    let sidebarStyle = {};
    sidebarStyle.width = sidebarWidth.toString() + 'px';
    let contentStyle = {};
    contentStyle.minWidth = contentWidth.toString() + 'px';

    // Annotation Task Related Varialbes and Functions
    let taskTotal = getTaskTotal();

    const goToTaskById = (id) => {
        if (id < 0 || id >= taskTotal) return;
        setAnnotationText(getTextById(id));
        setAnnotationLabels(getLabelById(id));
        setCurrentTaskId(id);
        setDrawState(!drawState);
    };

    const addLabelToTaskById = (id, label) => {
        let labelArray = getLabelById(id);
        if (canAddLabel(label, labelArray)) {
            labelArray.push(label);
            setAnnotationLabels(labelArray);
            setDrawState(!drawState);
            return true;
        }
        return false;
    }



    // State Hooks
    let [currentTaskId, setCurrentTaskId] = useState(0);
    let [annotationText, setAnnotationText] = useState(getTextById(0));
    let [annotationLabels, setAnnotationLabels] = useState(getLabelById(0));
    let [drawState, setDrawState] = useState(true);

    return (
        <div id="App" key = {drawState}>
            <Sidebar 
                sidebarStyle = {sidebarStyle}
                totalTaskNumber = {taskTotal}
                currentTaskId = {currentTaskId}
                goToTaskById = {goToTaskById}
            />
            <div className="content" style = {contentStyle}>
                    <Canvas 
                        str = {annotationText}
                        labels = {annotationLabels}
                        canvasWidth = {canvasWidth}
                        fontSize = {30}
                        fontFamily = {'Sans-serif'}
                        padding = {50}
                        charGap = {0}
                        lineGap = {20}
                        labelFontSize = {15}
                        labelFontFamily = {'Verdana'}
                        labelGap = {6}
                        labelTemplates = {labelTemplates}
                        addLabel = {addLabelToTaskById.bind(null, currentTaskId)}
                    />
            </div>
        </div>
    );
}

export default App;