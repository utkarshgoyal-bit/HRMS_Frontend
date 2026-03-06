import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir(path.join(__dirname, 'src'), function (filePath) {
    if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Skip api.js and Login.jsx as they were already modified
        if (filePath.endsWith('api.js') || filePath.endsWith('Login.jsx')) {
            return;
        }

        const regex = /const\s+API_URL\s*=\s*import\.meta\.env\.VITE_API_URL\s*\|\|\s*'http:\/\/127\.0\.0\.1:9999';(\s*\/\/\s*Define\s*API_URL)?/g;

        if (regex.test(content)) {
            content = content.replace(regex, "const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:9999').replace(/\\/+$/, '');");
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Updated:', filePath);
        }
    }
});
console.log('Done.');
