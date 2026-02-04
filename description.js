const fs = require('fs');
const path = require('path');

async function combineFilesRecursively(folderPath, outputFilePath) {
  let combinedContent = `
    export declare class EventEmitter {
      on:(type: string, handler: (e: GraphEvent) => void) => void;
    }
  `;

  async function processDirectory(currentPath) {
    const files = await fs.promises.readdir(currentPath);
    for (const file of files) {
      const filePath = path.join(currentPath, file);
      if ((await fs.promises.stat(filePath)).isDirectory()) {
        await processDirectory(filePath);
      } else if (filePath.endsWith('.d.ts') && (await fs.promises.stat(filePath)).isFile()) {
        const data = await fs.promises.readFile(filePath, 'utf8');
        const lines = data.split('\n');
        lines.forEach((line) => {
          line = line.trimStart();
          if (line.startsWith('import') || line.startsWith('export {')) {
            return;
          }
          combinedContent += (line + '\n');
        });
      }
    }
  }

  await processDirectory(folderPath);

  await fs.promises.writeFile(outputFilePath, combinedContent, 'utf8');
  console.log(`Successfully combined files into ${outputFilePath}`);
}

combineFilesRecursively('./esm', './xgraph.d.ts').catch((err) => console.error(err));
