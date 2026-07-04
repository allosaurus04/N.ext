chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "DOWNLOAD_FILES") {
        const fileList = request.files;

        for (const file of fileList) {
            chrome.downloads.download({
                url: file.url,
                filename: file.filename,
                conflictAction: 'uniquify',
            });
        }
        sendResponse({status: 'ok', count: fileList.length});
    }
});
