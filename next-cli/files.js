const fs = require('node:fs');
const path = require('node:path');
const { pipeline } = require('node:stream/promises');
const { Readable } = require('node:stream');

async function fetchCourseFiles(client, courseId) {
  return client.paginate(`/courses/${courseId}/files`, { 
    per_page: 100 
});
} //same as file_downloader

function sanitizedFileList(files) {
  return files.map(file => ({
    url: file.url,
    filename: file.display_name.replace(/[<>:"/\\|?*]+/g, '_'),
  }));
}

async function downloadFile(url, destPath, token) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }
  await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(destPath));
}

async function downloadCourseFiles(client, courseId, destDir, token) {
  const files = await fetchCourseFiles(client, courseId);
  const fileList = sanitizedFileList(files);

  await fs.promises.mkdir(destDir, { recursive: true });

  for (const file of fileList) {
    const destPath = path.join(destDir, file.filename);
    await downloadFile(file.url, destPath, token);
    console.log(`Downloaded ${file.filename}`);
  }

  return fileList.length;
}

module.exports = {downloadCourseFiles};
