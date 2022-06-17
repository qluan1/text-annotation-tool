function getDataFromFile(setData, setTaskIndex, drawStateRef, setDrawState, input) {
    // return 
    let file = input.files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
        let raw;
        try {
            raw = JSON.parse(reader.result);
        } catch (e) {
            raw = {error: 'Encountered an error while parsing as JSON File'};
        }
        let data;
        try {
            data = parseData(raw);
        } catch (e) {
            data = {error: 'Encountered an error while parsing as Annotation Tasks'}
        }
        setData(data);
        setTaskIndex(0);
        setDrawState(!drawStateRef.current);
    }
}

function parseData(rawData) {
    let data = {};

    // retain the same error
    if (rawData.error !== undefined) {
        data.error = rawData.error;
        return data;
    }

    // get the label templates
    data.labelTemplates = [];
    if (
        rawData.labelTemplates !== undefined &&
        typeof(rawData.labelTemplates) === typeof([]) &&
        rawData.labelTemplates.length !== 0
    ) {
        rawData.labelTemplates.forEach((lt) => {
            let [isValid, copy] = copyLabelTemplate(lt);
            if (isValid) {
                data.labelTemplates.push(copy);
            }
        });
    }

    // get the tasks

    if (
        rawData.tasks === undefined ||
        typeof(rawData) !== typeof([]) ||
        rawData.tasks.length === 0
    ) {
        data.error = 'Input data has no annotation tasks'
    }

    data.tasks = [];
    rawData.tasks.forEach((t) => {
        let [isValid, copy] = copyTask(t, data.labelTemplates);
        if (isValid) {
            data.tasks.push(copy);
        }
    });

    return data;
}

function copyLabelTemplate(lt) {
    let ct = {};
    
    if (
        lt.name === undefined ||
        typeof(lt.name) !== typeof('string')
    ) {
        return [false, null];
    }
    ct.name = lt.name.toUpperCase();

    ct.textColor = 'RGB(224, 58, 31)';
    // default label color
    if (
        lt.textColor !== undefined &&
        typeof(lt.textColor) === typeof('string') &&
        isRGBColor(lt.textColor)
    ) {
        ct.textColor = lt.textColor;
    }

    if (lt.isUnique !== undefined) {
        ct.isUnique = lt.isUnique;
    }

    return [true, ct];
}

function isRGBColor(str) {
    // verify if a string represents a color in RBG format
    // example RGB(127, 5, 3);
    str = str.toUpperCase().trim();
    if (str.indexOf('RGB') !== 0) {
        return false;
    }

    if (
        str.indexOf('(') === -1 ||
        str.indexOf(')') === -1
    ) {
        return false;
    }

    let start = str.indexOf('(') + 1;
    let end = str.indexOf(')');
    let vals = str.substring(start, end).split(',');

    if (vals.length !== 3) {
        return false;
    }

    for (let val of vals) {
        let v = parseInt(val);
        if (
            isNaN(v) ||
            v > 255 ||
            v < 0
        ) {
            return false;
        }
    }
    return true;
}

function copyTask(task, templates) {
    let copy = {};

    if (
        task.id === undefined ||
        typeof(task.id) !== typeof('string') 
    ) {
        return [false, null]; // this task has no id
    }
    copy.id = task.id; // copy task id

    if (
        task.context === undefined ||
        typeof(task.context) !== typeof('string') ||
        task.context === '' 
    ) {
        return [false, null]; // this task has no cotent
    }
    copy.context = task.context; // copy task context
    let contextLen = task.context.length;

    copy.labels = [];
    // copy pre-existing labels
    if (
        task.labels !== undefined &&
        typeof(task.labels) === typeof([]) &&
        task.labels.length > 0
    ) {
        task.labels.forEach((l) => {
            let [isValid, copiedLabel] = copyLabel(l, contextLen, templates);
            if (isValid) {
                copy.labels.push(copiedLabel);
            }
        });
    }

    return [true, copy];
}

function copyLabel(label, ctxLen, labelTemplates) {
    let copy = {};
    if (
        label.name === undefined ||
        typeof(label.name) !== typeof('string') ||
        label.name === '' 
    ) {
        return [false, null]; // no label name
    }
    copy.name = label.name.toUpperCase();

    let start = parseInt(label.startIndex);
    let end = parseInt(label.endIndex);
    if (
        isNaN(start) ||
        isNaN(end) ||
        start < 0 ||
        start > end || 
        end >= ctxLen
    ) {
        return [false, null]; // invalid start end index
    }
    copy.startIndex = start;
    copy.endIndex = end;

    copy.textColor = 'RGB(224, 58, 31)';
    // default label color

    if (
        label.textColor !== undefined &&
        typeof(label.textColor) === typeof('string') &&
        isRGBColor(label.textColor)
    ) {
        copy.textColor = label.textColor; // user specified color
    } else {
        labelTemplates.forEach((t) => {
            if (t.name === label.name) {
                copy.textColor = t.textColor; // label template color
            }
        });
    }

    if (
        label.canEdit !== undefined &&
        (
            label.canEdit === false ||
            label.canEdit === 'false'
        )
    ) {
        copy.canEdit = false;
    }

    return [true, copy];
}

function getTaskByIndex (data, index) {
    if (data.error !== undefined) {
        return {context: data.error, labels: []};
    }

    if (
        index === null ||
        data.tasks === undefined ||
        typeof(data.tasks) !== typeof([])||
        data.tasks.length <= index
    ) {
        return null;
    }
    return data.tasks[index];
}


function getTaskTotal (data) {
    if (
        data === undefined ||
        data.tasks === undefined ||
        typeof(data.tasks) !== typeof([])||
        data.tasks.length <= 0
    ) {
        return 0;
    }
    return data.tasks.length;
}


function canAddLabel (data, taskIndex, label) {
    if (
        data.tasks === undefined ||
        typeof(data.tasks) !== typeof([]) ||
        data.tasks.length <= taskIndex
    ) {
        return [false,  'invalid task'];
    }

    let task = data.tasks[taskIndex];
    // check if label is valid
    // sanity check
    let start = parseInt(label.startIndex);
    let end = parseInt(label.endIndex);
    if (
        isNaN(start) ||
        isNaN(end) ||
        start < 0 ||
        start > end ||
        end >= task.context.length
    ) {
        return [false, 'invalid label indices']; // invalid label indices
    }

    // 
    let hasDuplicate = false;
    let hasSameName = false;

    for (let l of task.labels) {
        if (label.name === l.name) {
            hasSameName = true;
        }
        if (
            label.name === l.name &&
            label.startIndex === l.startIndex &&
            label.endIndex === l.endIndex
        ) {
            hasDuplicate = true;
        }        
    }

    if (hasDuplicate) {
        return [false, 'this label already exists'];
    }

    if (hasSameName) {
        for (let t of data.labelTemplates) {
            if (
                t.name === label.name &&
                t.isUnique !== undefined &&
                (t.isUnique === true || t.isUnique === 'true')
            ) {
                return [false, 'attempted to add an existing unique label'];
            }
        }
    }

    return [true, null];
}

function addLabel (data, taskIndex, label) {
    let [canAdd, message] = canAddLabel(data, taskIndex, label);
    if (canAdd === true) {
        data.tasks[taskIndex].labels.push(label);
        return 'successfully added label';
    }
    return message;
}

function canDeleteLabel (data, taskIndex, label) {
    if (
        data.tasks === undefined ||
        typeof(data.tasks) !== typeof([]) ||
        data.tasks.length <= taskIndex
    ) {
        return [false,  'invalid task'];
    }

    let task = data.tasks[taskIndex];
    let lArray = task.labels;
    let lIndex;
    for (let i = 0; i < lArray.length; i++) {
        let l = lArray[i];
        if (
            l.name === label.name &&
            l.startIndex === label.startIndex &&
            l.endIndex === label.endIndex &&
            !(
                l.canEdit !== undefined &&
                l.canEdit === false
            )
        ){
            lIndex = i;
        }
    }

    if (lIndex === undefined) {
        return [false, null];
    }
    return [true, lIndex];
}

function deleteLabel (data, taskIndex, label) {
    let [canDelete, lIndex] = canDeleteLabel(data, taskIndex, label);
    if (canDelete) {
        data.tasks[taskIndex].labels.splice(lIndex, 1);
        return true;        
    }
    return false;
}


function outputDataStr (data) {
    //prepare the data for output
    //return a string
    if (data.error !== undefined) {
        return null;
    }

    let output = {};
    output.labelTemplates = [];
    output.tasks = [];

    data.labelTemplates.forEach((t) => {
        let [isValid, copy] = copyLabelTemplate(t);
        if (isValid) {
            output.labelTemplates.push(copy);
        }
    });

    for (const task of data.tasks) {
        let taskCopy = {};
        taskCopy.id = task.id;
        taskCopy.context = task.context;
        taskCopy.labels = [];
        task.labels.forEach((l) => {
            let [isValid, copy] = copyLabelForOutput(l, task.context, data.labelTemplates);
            if (isValid) {
                taskCopy.labels.push(copy);
            }
        });
        output.tasks.push(taskCopy);
    }

    return JSON.stringify(output, null, 4);
}

function copyLabelForOutput(label, context, labelTemplates) {
    let copy = {};
    if (
        label.name === undefined ||
        typeof(label.name) !== typeof('string') ||
        label.name === '' 
    ) {
        return [false, null]; // no label name
    }
    copy.name = label.name.toUpperCase();

    let start = parseInt(label.startIndex);
    let end = parseInt(label.endIndex);
    if (
        isNaN(start) ||
        isNaN(end) ||
        start < 0 ||
        start > end || 
        end >= context.length
    ) {
        return [false, null]; // invalid start end index
    }
    copy.startIndex = start;
    copy.endIndex = end;
    copy.text = context.substring(start, end+1);

    if (
        label.textColor !== undefined &&
        typeof(label.textColor) === typeof('string') &&
        isRGBColor(label.textColor)
    ) {
        let isUserSpecified = true;
        labelTemplates.forEach((t) => {
            if (t.name === label.name) {
                isUserSpecified = false;
            }
        });
        if (isUserSpecified) {
            copy.textColor = label.textColor
        }
    }

    if (
        label.canEdit !== undefined &&
        (
            label.canEdit === false ||
            label.canEdit === 'false'
        )
    ) {
        copy.canEdit = false;
    }

    return [true, copy];    
}

export { getDataFromFile, addLabel, deleteLabel, getTaskByIndex, getTaskTotal, outputDataStr };