import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getHomePage = (req, res) => {
    res.render('playground', { output: null });
};

// export const runCode = (req, res) => {
//     const { language, code, input } = req.body;

//     const extensions = {
//         python: 'py',
//         javascript: 'js',
//         java: 'java',
//         c: 'c',
//         cpp: 'cpp',
//         ruby: 'rb',
//         php: 'php',
//         swift: 'swift',
//         go: 'go',
//         rust: 'rs',
//         kotlin: 'kt',
//         r: 'r',
//         sql: 'sql',
//         typescript: 'ts',
//         scala: 'scala',
//         perl: 'pl',
//         bash: 'sh',
//         powershell: 'ps1',
//         'objective-c': 'm',
//         lua: 'lua',
//         matlab: 'm',
//     };

//     const extension = extensions[language];
//     if (!extension) {
//         return res.json({ error: 'Language not supported' });
//     }

//     const tempDir = path.join(__dirname, '../temp');
//     if (!fs.existsSync(tempDir)) {
//         fs.mkdirSync(tempDir, { recursive: true });
//     }

//     const fileName = path.join(tempDir, `code.${extension}`);
//     fs.writeFileSync(fileName, code);

//     let command = '';
//     switch (language) {
//         case 'python':
//             command = `echo "${input}" | python3 ${fileName}`;
//             break;
//         case 'javascript':
//             command = `echo "${input}" | node ${fileName}`;
//             break;
//         case 'java':
//             command = `javac ${fileName} && echo "${input}" | java ${fileName.replace('.java', '')}`;
//             break;
//         case 'c':
//             command = `gcc ${fileName} -o ${fileName.replace('.c', '')} && echo "${input}" | ${fileName.replace('.c', '')}`;
//             break;
//         case 'cpp':
//             command = `g++ ${fileName} -o ${fileName.replace('.cpp', '')} && echo "${input}" | ${fileName.replace('.cpp', '')}`;
//             break;
//         case 'ruby':
//             command = `echo "${input}" | ruby ${fileName}`;
//             break;
//         case 'php':
//             command = `php ${fileName}`;
//             break;
//         case 'swift':
//             command = `swift ${fileName}`;
//             break;
//         case 'go':
//             command = `go run ${fileName}`;
//             break;
//         case 'rust':
//             command = `rustc ${fileName} && echo "${input}" | ${fileName.replace('.rs', '')}`;
//             break;
//         case 'kotlin':
//             command = `kotlinc ${fileName} -include-runtime -d ${fileName.replace('.kt', '.jar')} && echo "${input}" | java -jar ${fileName.replace('.kt', '.jar')}`;
//             break;
//         case 'r':
//             command = `echo "${input}" | Rscript ${fileName}`;
//             break;
//         case 'sql':
//             command = `sqlite3 < ${fileName}`;
//             break;
//         case 'typescript':
//             command = `ts-node ${fileName}`;
//             break;
//         case 'scala':
//             command = `scala ${fileName}`;
//             break;
//         case 'perl':
//             command = `perl ${fileName}`;
//             break;
//         case 'bash':
//             command = `bash ${fileName}`;
//             break;
//         case 'powershell':
//             command = `pwsh -File ${fileName}`;
//             break;
//         case 'objective-c':
//             command = `gcc ${fileName} -o ${fileName.replace('.m', '')} -framework Foundation && echo "${input}" | ${fileName.replace('.m', '')}`;
//             break;
//         case 'lua':
//             command = `lua ${fileName}`;
//             break;
//         case 'matlab':
//             command = `matlab -batch "run('${fileName}')"`;
//             break;
//         default:
//             return res.json({ error: 'Language not supported' });
//     }

//     exec(command, (error, stdout, stderr) => {
//         fs.unlinkSync(fileName); // Clean up file
//         if (error) {
//             return res.json({ error: stderr || error.message });
//         }
//         res.json({ output: stdout });
//     });
// };


export const runCode = (req, res) => {
    const { language, code, input } = req.body;

    const dockerImages = {
        python: 'python:3.11',
        javascript: 'node:23',
        java: 'openjdk:23',
        c: 'gcc:latest',
        cpp: 'gcc:latest',
        ruby: 'ruby:3.2',
        php: 'php:8.2-cli',
        swift: 'swift:5.8',
        go: 'golang:1.20',
        rust: 'rust:1.72',
        kotlin: 'openjdk:17',
        r: 'r-base:4.3',
        typescript: 'node:23',
        scala: 'hseeberger/scala-sbt:17.0.8_1.9.4_3.4.3',
        perl: 'perl:5.36',
        bash: 'bash:latest',
        lua: 'lua:5.4',
    };

    const extensions = {
        python: 'py',
        javascript: 'js',
        java: 'java',
        c: 'c',
        cpp: 'cpp',
        ruby: 'rb',
        php: 'php',
        swift: 'swift',
        go: 'go',
        rust: 'rs',
        kotlin: 'kt',
        r: 'r',
        typescript: 'ts',
        scala: 'scala',
        perl: 'pl',
        bash: 'sh',
        lua: 'lua',
    };

    const image = dockerImages[language];
    const extension = extensions[language];
    if (!image || !extension) {
        return res.json({ error: 'Language not supported' });
    }

    const tempDir = path.resolve(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const fileName = path.join(tempDir, `code.${extension}`);
    fs.writeFileSync(fileName, code);

    const dockerCommand = `
        docker run --rm -v "${tempDir}:/app" -w /app ${image} sh -c \
        "${input ? `echo '${input.replace(/'/g, `'\\''`)}' |` : ''} ${
        ['python', 'ruby', 'php', 'bash', 'perl', 'lua'].includes(language)
            ? `${language} /app/code.${extension}`
            : language === 'javascript'
            ? `node /app/code.${extension}`
            : language === 'typescript'
            ? `ts-node /app/code.${extension}`
            : language === 'java'
            ? `javac /app/code.${extension} && java /app/code`
            : language === 'scala'
            ? `scalac /app/code.${extension} && scala /app/code`
            : language === 'go'
            ? `go run /app/code.${extension}`
            : language === 'swift'
            ? `swift /app/code.${extension}`
            : language === 'rust'
            ? `rustc /app/code.${extension} && ./code`
            : language === 'c'
            ? `gcc /app/code.${extension} -o code && ./code`
            : language === 'cpp'
            ? `g++ /app/code.${extension} -o code && ./code`
            : ''
    }"
    `;

    exec(dockerCommand, (error, stdout, stderr) => {
        fs.unlinkSync(fileName); // Clean up the temporary file
        if (error) {
            return res.json({ error: stderr || error.message });
        }
        res.json({ output: stdout.trim() });
    });
};
