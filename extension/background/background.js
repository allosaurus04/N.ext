chrome.runtime.onMessage.addListener((request, sendResponse) => {
    if (request.type === "DOWNLOAD_FILES") {
        const fileList = request.files;

        for (const file of fileList) {
            // loop over values not keys so of not in 
            chrome.downloads.download({
                url: file.url,
                filename: file.filename,
                conflictAction: 'overwrite', //duplicate handling
            });
        }
        sendResponse({status: 'ok', count: fileList.length});
    }
});

