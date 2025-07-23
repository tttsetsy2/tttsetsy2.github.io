function displayMessage(msg, isError = false) {
    const messagesDiv = document.getElementById('messages');
    const keyMessagesDiv = document.getElementById('keyMessages');
    
    // Always update both messages divs
    [messagesDiv, keyMessagesDiv].forEach(div => {
        div.textContent = msg;
        div.className = 'messages';
        if (isError) {
            div.classList.add('error');
        }
        
        if (msg) {
            div.classList.add('show');
            setTimeout(() => {
                div.classList.remove('show');
            }, 5000);
        } else {
            div.classList.remove('show');
        }
    });
}

function decrypt(inputString, keyString) {
    let keyStep = 0;
    let decrypted = '';
    const keyLength = keyString.length;

    if (keyLength === 0) {
        throw new Error("Key cannot be empty. Please provide a valid key.");
    }

    for (let i = 0; i < inputString.length; i++) {
        keyStep++;
        if (keyStep > keyLength) {
            keyStep = 1;
        }
        let inputCharCode = inputString.charCodeAt(i);
        let keyCharCode = keyString.charCodeAt(keyStep - 1);

        let result = inputCharCode - keyCharCode;
        if (result < 0) {
            result += 256;
        }
        decrypted += String.fromCharCode(result);
    }
    return decrypted;
}

function encrypt(inputString, keyString) {
    let keyStep = 0;
    let encrypted = '';
    const keyLength = keyString.length;

    if (keyLength === 0) {
        throw new Error("Key cannot be empty. Please provide a valid key.");
    }

    for (let i = 0; i < inputString.length; i++) {
        keyStep++;
        if (keyStep > keyLength) {
            keyStep = 1;
        }
        let inputCharCode = inputString.charCodeAt(i);
        let keyCharCode = keyString.charCodeAt(keyStep - 1);

        let result = (inputCharCode + keyCharCode) % 256;
        encrypted += String.fromCharCode(result);
    }
    return encrypted;
}

function downloadFile(content, filename, mimeType = 'text/plain;charset=utf-8') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', () => {
    const keyInput = document.getElementById('keyInput');
    const fileUpload = document.getElementById('fileUpload');
    const decryptButton = document.getElementById('decryptButton');
    const encryptButton = document.getElementById('encryptButton');
    const keyTab = document.getElementById('keyTab');
    const infoTab = document.getElementById('infoTab');
    const editorTab = document.getElementById('editorTab');
    const keyPanel = document.getElementById('keyPanel');
    const infoPanel = document.getElementById('infoPanel');
    const editorPanel = document.getElementById('editorPanel');
    const saveKeyButton = document.getElementById('saveKeyButton');

    // Load key from localStorage if available for persistence
    const savedKey = localStorage.getItem('pb95_key');
    if (savedKey) {
        keyInput.value = savedKey;
    }

    function switchTab(tabName) {
        keyPanel.classList.remove('active');
        infoPanel.classList.remove('active');
        editorPanel.classList.remove('active');
        keyTab.classList.remove('active');
        infoTab.classList.remove('active');
        editorTab.classList.remove('active');

        if (tabName === 'key') {
            keyPanel.classList.add('active');
            keyTab.classList.add('active');
        } else if (tabName === 'info') {
            infoPanel.classList.add('active');
            infoTab.classList.add('active');
        } else {
            editorPanel.classList.add('active');
            editorTab.classList.add('active');
        }
    }

    keyTab.addEventListener('click', () => switchTab('key'));
    infoTab.addEventListener('click', () => switchTab('info'));
    editorTab.addEventListener('click', () => switchTab('editor'));

    saveKeyButton.addEventListener('click', () => {
        const key = keyInput.value.trim();
        if (!key) {
            displayMessage("Error: Key field is empty. Please enter a key.", true);
            return;
        }

        try {
            const testResult = decrypt('\u00B3\u00B6', key);
            if (testResult === '{}') {
                localStorage.setItem('pb95_key', key);
                displayMessage("");
                switchTab('editor');
            } else {
                displayMessage("Warning: Key validation failed. Double-check your key.", true);
            }
        } catch (error) {
            displayMessage(`Error validating key: ${error.message}`, true);
        }
    });

    function readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.onerror = (event) => reject(event.target.error);
            reader.readAsText(file, 'UTF-8');
        });
    }

    async function processFile(operation) {
        displayMessage(''); // Clear previous messages

        const key = localStorage.getItem('pb95_key');
        if (!key) {
            displayMessage("Error: Key not saved. Please save a key first.", true);
            return;
        }

        const file = fileUpload.files[0];
        if (!file) {
            displayMessage("Error: No file selected. Please choose a file.", true);
            return;
        }

        try {
            const fileContent = await readFileAsText(file);
            let outputContent;
            let outputFilename;

            if (operation === 'decrypt') {
                outputContent = decrypt(fileContent, key);
                outputFilename = 'decrypted_save.txt';
                displayMessage("File decrypted successfully! Check your downloads for 'decrypted_save.txt'");
            } else if (operation === 'encrypt') {
                outputContent = encrypt(fileContent, key);
                outputFilename = 'encrypted_save.txt';
                displayMessage("File encrypted successfully! Check your downloads for 'encrypted_save.txt'");
            }

            downloadFile(outputContent, outputFilename);

        } catch (error) {
            console.error("Processing error:", error);
            displayMessage(`Error: ${error.message}`, true);
        }
    }

    decryptButton.addEventListener('click', () => processFile('decrypt'));
    encryptButton.addEventListener('click', () => processFile('encrypt'));
});