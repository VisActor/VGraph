/* eslint-disable no-undef */
const fs = require('fs');
const path = require('path');
const fileList = [];
function listFiles(dir) {
    const fileOrDirs = fs.readdirSync(dir);
    fileOrDirs.forEach(file => {
        const fileOrDirPath = path.join(dir, file);
        const stats = fs.statSync(fileOrDirPath);
        if (stats.isDirectory()) {
            listFiles(fileOrDirPath);
        } else {
            fileList.push(fileOrDirPath);
        }
    });
}
listFiles('./src');
const re = new RegExp('from.*\'.*src.*\'|from.*".*src.*"');
fileList.forEach(file => {
    const text = fs.readFileSync(file, 'utf8');
    const lines = text.split('\n');
    lines.forEach((line, index) => {
        if (re.test(line)) {
            console.log(`file ${file} line ${index + 1}: ${line}`);
            process.exit(1);
        }
    });
});