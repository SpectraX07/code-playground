window.onload = function () {
    initializeCodePlayground();
};

function initializeCodePlayground() {
    require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor/min/vs' } });
    require(['vs/editor/editor.main'], function () {
        const editor = createMonacoEditor();
        const terminal = createTerminal();

        if (terminal) {
            setupLanguageSelector(editor);
            setupRunButton(editor, terminal);
        } else {
            console.error("Failed to initialize terminal. xterm.js might be missing.");
        }
    });
}

function createMonacoEditor() {
    return monaco.editor.create(document.getElementById('editor'), {
        value: '// Write your code here...',
        language: 'javascript',
        theme: 'vs-dark',
        automaticLayout: true // Ensures the editor resizes automatically
    });
}

function createTerminal() {
    if (typeof Terminal === 'undefined') {
        console.error("xterm.js (Terminal) not found!");
        return null;
    }

    const terminal = new Terminal({
        cursorBlink: true,
        theme: {
            background: '#000000',
            foreground: '#FFFFFF'
        },
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        padding: 10 // Add padding to all sides
    });

    // Add additional padding to the terminal container
    const terminalElement = document.getElementById('terminal');
    terminalElement.style.padding = '12px';

    terminal.open(terminalElement);
    terminal.writeln("Welcome to the Code Playground!");
    return terminal;
}

function setupLanguageSelector(editor) {
    const languageSelector = document.getElementById('language');
    const helloWorldCode = {
        python: 'print("Hello, World!")',
        javascript: 'console.log("Hello, World!");',
        java: `
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
`.trim(),
        c: `
#include <stdio.h>
int main() {
    printf("Hello, World!\\n");
    return 0;
}
`.trim(),
        cpp: `
#include <iostream>
int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
`.trim(),
        ruby: 'puts "Hello, World!"',
        php: '<?php echo "Hello, World!"; ?>',
        swift: 'print("Hello, World!")',
        go: `
package main
import "fmt"
func main() {
    fmt.Println("Hello, World!")
}
`.trim(),
        rust: `
fn main() {
    println!("Hello, World!");
}
`.trim(),
        kotlin: `
fun main() {
    println("Hello, World!")
}
`.trim(),
        r: 'print("Hello, World!")',
        sql: '-- SQL does not typically run standalone scripts\nSELECT "Hello, World!";',
        typescript: 'console.log("Hello, World!");',
        scala: 'object HelloWorld extends App { println("Hello, World!") }',
        perl: 'print "Hello, World!\\n";',
        bash: 'echo "Hello, World!"',
        powershell: 'Write-Output "Hello, World!"',
        'objective-c': `
#import <Foundation/Foundation.h>
int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSLog(@"Hello, World!");
    }
    return 0;
}
`.trim(),
        lua: 'print("Hello, World!")',
        matlab: 'disp("Hello, World!")'
    };

    languageSelector.addEventListener('change', () => {
        const selectedLang = languageSelector.value;
        const defaultCode = helloWorldCode[selectedLang] || '// No default code available';
        editor.setValue(defaultCode);
        monaco.editor.setModelLanguage(editor.getModel(), selectedLang);
    });
}


function setupRunButton(editor, terminal) {
    const runButton = document.getElementById('run');
    const languageSelector = document.getElementById('language');

    runButton.addEventListener('click', async () => {
        const code = editor.getValue();
        const language = languageSelector.value;

        terminal.clear();
        terminal.writeln("Running your code...");

        try {
            const result = await executeCode(code, language, terminal);
            displayResult(result, terminal);
        } catch (error) {
            handleExecutionError(error, terminal);
        }
    });
}

async function executeCode(code, language, terminal) {
    terminal.writeln('\x1B[1;3;32m$ Running ' + language + ' code:\x1B[0m');
    terminal.writeln(code);
    const response = await fetch('/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

function displayResult(result, terminal) {
    if (result.output) {
        terminal.writeln('\x1B[1;3;33m$ Execution complete.\x1B[0m');
        terminal.writeln(result.output);
    } else if (result.error) {
        terminal.writeln(`Error: ${result.error}`);
    } else {
        terminal.writeln("No output or error received.");
    }
}

function handleExecutionError(error, terminal) {
    console.error("An error occurred while running the code:", error);
    terminal.writeln("An error occurred while running your code.");
    terminal.writeln(`Error details: ${error.message}`);
}

