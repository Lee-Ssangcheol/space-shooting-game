// Electron 환경인지 확인
const isElectron = window && window.process && window.process.type;

if (isElectron) {
    const { contextBridge, ipcRenderer } = require('electron');

    // 렌더러 프로세스에 API 노출
    contextBridge.exposeInMainWorld('electron', {
        ipcRenderer: {
            invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args)
        }
    });

    contextBridge.exposeInMainWorld('electronAPI', {
        saveScore: (score) => ipcRenderer.invoke('save-score', score),
        loadScore: () => ipcRenderer.invoke('load-score'),
        resetScore: () => ipcRenderer.invoke('reset-score'),
        getSoundPath: (filename) => ipcRenderer.invoke('get-sound-path', filename)
    });
} else {
    // 웹 브라우저 환경에서의 폴백 구현
    window.electronAPI = {
        saveScore: async (score) => {
            try {
                localStorage.setItem('highScore', score);
                return true;
            } catch (error) {
                console.error('점수 저장 실패:', error);
                return false;
            }
        },
        loadScore: async () => {
            try {
                return localStorage.getItem('highScore') || 0;
            } catch (error) {
                console.error('점수 로드 실패:', error);
                return 0;
            }
        },
        resetScore: async () => {
            try {
                localStorage.removeItem('highScore');
                return true;
            } catch (error) {
                console.error('점수 초기화 실패:', error);
                return false;
            }
        },
        getSoundPath: async (filename) => {
            return `sounds/${filename}`;
        }
    };
} 