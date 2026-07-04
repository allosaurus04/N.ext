document.addEventListener('click', (event) => {
    const btn = event.target.closest('.download-btn');
    if (!btn || btn.disabled == true) return;

    const courseId = btn.dataset.courseId;
    event.preventDefault();
    event.stopPropagation();

    btn.disabled = true;

    downloadCourseFiles(courseId)
    .catch((err) => {console.error('Error downloading course files:', err);})
    .finally(() => {btn.disabled = false;});
});

async function fetchCourseFiles(courseId) {
    const response = await fetch(`/api/v1/courses/${courseId}/files?per_page=100`, { credentials: 'same-origin' });
    console.log('files api status:', response.status);
    if (!response.ok) {
        throw new Error(`Failed to fetch files for course ${courseId}: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

async function downloadCourseFiles(courseId) {
    const files = await fetchCourseFiles(courseId);
    console.log('Fetched files:', files.length,'files');
    // Transform the raw Canvas file objects into a minimal list of { url, filename } pairs
    const fileList = files.map(file => {
        // Sanitize filename: remove illegal path characters and use forward slashes for subfolders
        const sanitizedFilename = file.display_name.replace(/[<>:"/\\|?*]+/g, '_');
        return { url: file.url, filename: sanitizedFilename };
    });
    console.log('Transformed file list:', fileList.length,'files');  
    // send list to background
    chrome.runtime.sendMessage({type: 'DOWNLOAD_FILES', files: fileList}, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Didnt send to service worker');
        } else {
            console.log('Successfully sent files to service worker for download:', response);
        }
        });
    }
    
// console check
// const testNames = [
//   "Lecture 1: Topic1_R_Introduction.pdf",
//   "Tutorial 3 (What/Why?).docx",
//   "CS1010 <draft>.txt",
//   "normal_file.pdf"
// ];
// testNames.forEach(n => console.log(n, "to", n.replace(/[<>:"/\\|?*]+/g, '_')));