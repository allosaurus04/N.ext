const courseId = btn.dataset.courseId;

document.addEventListener('click', (event) => {
    const btn = event.target.closest('.download-btn');
    if (!btn || btn.disabled == true) return;

    event.preventDefault();
    event.stopPropogation();

    btn.disabled = true;

    downloadCourseFiles(courseId)
    .catch((err) => {console.error('Error downloading course files:', err);})
    .finally(() => {btn.disabled = false;});
});

async function downloadCourseFiles(courseId) {
    const files = await fetchCourseFiles(courseId);
    console.log('Fetched files:', files.length,'files');
    // remaining 
}

async function fetchCourseFiles(courseId) {
    const response = await fetch(`/api/v1/courses/${courseId}/files?per_page=100`, { credentials: 'same-origin' });
    if (!response.ok) {
        throw new Error(`Failed to fetch files for course ${courseId}: ${response.status} ${response.statusText}`);
    }
    return response.json();

}


















