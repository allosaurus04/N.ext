// prettier-ignore
{// for v1: to keep it simple always download, and pass conflictAction: 'uniquify' (or 'overwrite') to chrome.downloads.download

//1. click handle: content.js injects a button into the dashboard card, and adds an event listener to it. When clicked, it sends a message to background.js with the courseId and taskId. file_dowloader.js listens for this message and calls the downloadFile function with the courseId and taskId. The downloadFile function constructs the URL for the file and uses chrome.downloads.download to download it. ideally, prevent double clicks by disabling the button after the first click, and re-enabling it after the download is complete.


// 2. Fetch the file list. A function that calls /api/v1/courses/:id/files?per_page=100 with plain fetch() (same-origin, session cookies ride along). Handle pagination by following the Link: <...>; rel="next" response header until it's absent — don't guess page counts. Docs: Canvas Files API and Pagination.


// 3.Transform the raw Canvas file objects into a minimal list of { url, filename } pairs. Two things to sanitize in filename: illegal path characters (Chrome rejects things like : or ? in filenames the download fails silently with a filename error), and use forward slashes for subfolders since filename is a relative path under the Downloads directory, never absolute. Docs: chrome.downloads.download under DownloadOptions, note the filename and conflictAction fields there. 


// 4. send the list to background. One chrome.runtime.sendMessage({ type: "DOWNLOAD_FILES", files }) call. The content script's job ends here — chrome.downloads is unavailable in content scripts, which is the entire reason background.js exists. Docs: Message passing. 

// 5. debugging: Listen for a response/callback from background and flip the button state ("Downloading to Done"), or at minimum log the count/files downloaded. Not required for it to work, but you'll thank yourself when debugging.
}


