const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

// 점수 파일 경로
const scoreFilePath = path.join(app.getPath('userData'), 'space-shooting-game-highscore.json');

// 사운드 파일 경로 설정
const getSoundPath = (filename) => {
    if (app.isPackaged) {
        return path.join(process.resourcesPath, 'sounds', filename);
    }
    return path.join(__dirname, 'sounds', filename);
};

// 사운드 파일 존재 여부 확인
const checkSoundFiles = () => {
    const soundFiles = ['shoot.mp3', 'explosion.mp3', 'collision.mp3'];
    const missingFiles = [];
    
    soundFiles.forEach(file => {
        const filePath = getSoundPath(file);
        if (!fs.existsSync(filePath)) {
            missingFiles.push(file);
        }
    });
    
    if (missingFiles.length > 0) {
        console.error('Missing sound files:', missingFiles);
    }
    
    return missingFiles.length === 0;
};

// 점수 파일 초기화
function initScoreFile() {
    if (!fs.existsSync(scoreFilePath)) {
        fs.writeFileSync(scoreFilePath, JSON.stringify({ highScore: 0 }));
    }
}

// 점수 저장 함수
function saveScore(score) {
    try {
        const data = JSON.parse(fs.readFileSync(scoreFilePath, 'utf8'));
        if (score > data.highScore) {
            data.highScore = score;
            fs.writeFileSync(scoreFilePath, JSON.stringify(data));
            return true;
        }
        return false;
    } catch (error) {
        console.error('점수 저장 실패:', error);
        return false;
    }
}

// 점수 로드 함수
function loadScore() {
    try {
        const data = JSON.parse(fs.readFileSync(scoreFilePath, 'utf8'));
        return data.highScore;
    } catch (error) {
        console.error('점수 로드 실패:', error);
        return 0;
    }
}

// 점수 초기화 함수
function resetScore() {
    try {
        fs.writeFileSync(scoreFilePath, JSON.stringify({ highScore: 0 }));
        return true;
    } catch (error) {
        console.error('점수 초기화 실패:', error);
        return false;
    }
}

function createWindow() {
    // package.json에서 버전 정보 읽기
    const packageJson = require('./package.json');
    const version = packageJson.version;

    const win = new BrowserWindow({
        width: 1200,
        height: 900,
        minWidth: 1000,
        minHeight: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        backgroundColor: '#E0E0E0',
        icon: path.join(__dirname, 'build/icon.ico')
    });

    // 윈도우 제목 설정
    win.setTitle(`스페이스 슈팅게임 ${version}`);

    // 메뉴 설정
    const template = [
        {
            label: '파일',
            submenu: [
                { role: 'quit', label: '종료' }
            ]
        },
        {
            label: '편집',
            submenu: [
                { role: 'undo', label: '실행 취소' },
                { role: 'redo', label: '다시 실행' },
                { type: 'separator' },
                { role: 'cut', label: '잘라내기' },
                { role: 'copy', label: '복사' },
                { role: 'paste', label: '붙여넣기' },
                { role: 'delete', label: '삭제' },
                { role: 'selectAll', label: '모두 선택' }
            ]
        },
        {
            label: '보기',
            submenu: [
                { role: 'reload', label: '새로고침' },
                { role: 'forceReload', label: '강력 새로고침' },
                { role: 'toggleDevTools', label: '개발자 도구 토글' },
                { type: 'separator' },
                { role: 'resetZoom', label: '화면 크기 초기화' },
                { role: 'zoomIn', label: '확대' },
                { role: 'zoomOut', label: '축소' },
                { type: 'separator' },
                { role: 'togglefullscreen', label: '전체 화면' }
            ]
        },
        {
            label: '창',
            submenu: [
                { role: 'minimize', label: '최소화' },
                { role: 'close', label: '닫기' }
            ]
        },
        {
            label: '도움말',
            submenu: [
                {
                    label: '정보',
                    click() {
                        dialog.showMessageBox(null, {
                            type: 'info',
                            title: '스페이스 슈팅게임 정보',
                            message: `버전: ${packageJson.version}`,
                            detail: `Electron: ${process.versions.electron}\nChrome: ${process.versions.chrome}\nNode.js: ${process.versions.node}`
                        });
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    win.loadFile('index.html');
    
    // 개발자 도구는 개발 시에만 사용
    // win.webContents.openDevTools();
}

app.whenReady().then(() => {
    initScoreFile();
    checkSoundFiles(); // 사운드 파일 확인
    createWindow();

    // IPC 이벤트 핸들러 등록
    ipcMain.handle('save-score', async (event, score) => {
        try {
            const scorePath = path.join(app.getPath('userData'), 'highscore.json');
            await fs.promises.writeFile(scorePath, JSON.stringify({ score }));
            return true;
        } catch (error) {
            console.error('점수 저장 실패:', error);
            return false;
        }
    });

    ipcMain.handle('load-score', async () => {
        try {
            const scorePath = path.join(app.getPath('userData'), 'highscore.json');
            const data = await fs.promises.readFile(scorePath, 'utf8');
            return JSON.parse(data).score;
        } catch (error) {
            console.error('점수 로드 실패:', error);
            return 0;
        }
    });

    ipcMain.handle('reset-score', async () => {
        try {
            const scorePath = path.join(app.getPath('userData'), 'highscore.json');
            await fs.promises.writeFile(scorePath, JSON.stringify({ score: 0 }));
            return true;
        } catch (error) {
            console.error('점수 초기화 실패:', error);
            return false;
        }
    });

    // 사운드 파일 경로 전달
    ipcMain.handle('get-sound-path', async (event, filename) => {
        return getSoundPath(filename);
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
}); 