function createFileAndGetURL(text, fileURL) {

    let data = new Blob([text], {type: 'text/plain'});

    if (fileURL !== null) {
        window.URL.revokeObjectURL(fileURL);
    }

    fileURL = window.URL.createObjectURL(data);

    return fileURL;
}


export { createFileAndGetURL };