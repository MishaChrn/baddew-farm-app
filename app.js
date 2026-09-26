// Baddew Browser Farm - Phase 1

// --- Global State ---
let gameState = null;
let currentUUID = null;
let currentName = null;

let hasPostedThisSession = false;

// --- Phase 4 State ---
let selectedSlotIndex = null;
let sessionActions = {
    planted: {},
    watered: {},
    harvested: {}
};

// --- Helper Functions ---
function generateUUID() {
    return crypto.randomUUID();
}

function initLocalUser() {
    let uuid = localStorage.getItem('baddew_uuid');
    let name = localStorage.getItem('baddew_name');
    
    if (!uuid) {
        uuid = generateUUID();
        localStorage.setItem('baddew_uuid', uuid);
    }
    
    currentUUID = uuid;
    currentName = name; // Can be null initially
}

function createNewGameState() {
    let grid = [];
    for (let i = 0; i < 9; i++) {
        let cropType = 'Potato';
        if (i >= 3 && i < 6) cropType = 'Carrot';
        if (i >= 6) cropType = 'Mish-Mash Seeds';

        grid.push({
            cropType: cropType,
            growthStage: 0,
            waterCount: 0,
            plantedBy: null
        });
    }

    return {
        version: "1.0",
        baddewPoints: 0,
        players: {}, // Map of UUID -> { name: string }
        chatMessages: [],
        farmGrid: grid
    };
}

function addLog(message) {
    const logContent = document.getElementById('log-content');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logContent.prepend(entry);
}

function handleActionSuccess(actionType, cropType) {
    // 1. Update Session Tracking
    sessionActions[actionType][cropType] = (sessionActions[actionType][cropType] || 0) + 1;

    // 2. Update Personal Total Actions & Baddew Points
    let player = gameState.players[currentUUID];
    if (!player.totalActions) player.totalActions = 0;
    
    player.totalActions += 1;
    
    if (player.totalActions > 0 && player.totalActions % 10 === 0) {
        gameState.baddewPoints = (gameState.baddewPoints || 0) + 1;
        addLog(`🎉 You reached ${player.totalActions} actions! Earned 1 Baddew Point.`);
        renderPoints();
    }
}

// --- Phase 2 Render Functions ---
function renderPoints() {
    if (!gameState) return;
    document.getElementById('display-baddew-points').textContent = gameState.baddewPoints;
}

function renderChatMessages() {
    if (!gameState) return;
    const chatContainer = document.getElementById('chat-messages');
    chatContainer.innerHTML = '';
    
    gameState.chatMessages.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message';
        
        const authorSpan = document.createElement('span');
        authorSpan.className = 'chat-author';
        authorSpan.textContent = `${msg.author}:`;
        
        const textNode = document.createTextNode(` ${msg.text}`);
        
        msgDiv.appendChild(authorSpan);
        msgDiv.appendChild(textNode);
        
        chatContainer.appendChild(msgDiv);
    });
}

function getEmojiForGrowthStage(cropType, growthStage) {
    if (growthStage === 0) return '';
    if (growthStage === 1) return '⚫️'; // Seed
    if (growthStage === 2) return '🌱'; // Sprout
    
    // Harvestable
    if (cropType === 'Potato') return '🥔';
    if (cropType === 'Carrot') return '🥕';
    return '🐶'; // Mish-Mash Seeds
}

function renderFarmGrid() {
    if (!gameState) return;
    const gridContainer = document.getElementById('farm-grid');
    gridContainer.innerHTML = '';

    gameState.farmGrid.forEach((slot, index) => {
        const slotDiv = document.createElement('div');
        slotDiv.className = 'farm-slot';
        if (selectedSlotIndex === index) {
            slotDiv.classList.add('selected-slot');
        }
        slotDiv.dataset.index = index;
        
        slotDiv.textContent = getEmojiForGrowthStage(slot.cropType, slot.growthStage);
        
        // Slot selection logic
        slotDiv.addEventListener('click', () => {
            selectedSlotIndex = index;
            renderFarmGrid(); // Re-render to update highlight
        });

        gridContainer.appendChild(slotDiv);
    });
}

// --- UI Management ---
function updateUIForGameplay() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('game-section').classList.remove('hidden');
    
    document.getElementById('user-info-area').classList.remove('hidden');
    document.getElementById('display-player-name').textContent = currentName;

    // Render Phase 2 UI
    renderPoints();
    renderChatMessages();
    
    // Render Phase 3 UI
    renderFarmGrid();
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    initLocalUser();

    const btnStartGame = document.getElementById('btn-start-game');
    const inputNewPlayerName = document.getElementById('new-player-name');
    
    const btnTriggerLoad = document.getElementById('btn-trigger-load');
    const fileLoadGame = document.getElementById('file-load-game');
    
    const btnSaveExport = document.getElementById('btn-save-export');

    // 1. Start New Game
    btnStartGame.addEventListener('click', () => {
        const name = inputNewPlayerName.value.trim();
        if (!name) {
            alert('Please enter your name.');
            return;
        }

        currentName = name;
        localStorage.setItem('baddew_name', currentName);

        gameState = createNewGameState();
        gameState.players[currentUUID] = { name: currentName };

        hasPostedThisSession = false;
        sessionActions = {
            planted: {},
            watered: {},
            harvested: {}
        };

        addLog(`Started a new farm as ${currentName}.`);
        updateUIForGameplay();
    });

    // 2. Load Game Trigger
    btnTriggerLoad.addEventListener('click', () => {
        fileLoadGame.click();
    });

    // 3. Load Game Logic
    fileLoadGame.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const decodedString = decodeURIComponent(atob(e.target.result));
                const loadedData = JSON.parse(decodedString);
                
                // Very basic validation
                if (!loadedData.players) {
                    throw new Error("Invalid save data format.");
                }

                gameState = loadedData;

                hasPostedThisSession = false;
                sessionActions = {
                    planted: {},
                    watered: {},
                    harvested: {}
                };

                // Check if this device is recognized in the save file
                if (!gameState.players[currentUUID]) {
                    // Prompt for name if UUID is not found
                    let name = prompt("Welcome to this farm! Please enter your name:");
                    if (!name || name.trim() === "") {
                        alert("Name is required to join this farm.");
                        return; // Abort load
                    }
                    currentName = name.trim();
                    localStorage.setItem('baddew_name', currentName);
                    gameState.players[currentUUID] = { name: currentName };
                    addLog(`Joined the farm as ${currentName}.`);
                } else {
                // User exists in the save file
                    currentName = gameState.players[currentUUID].name;
                    localStorage.setItem('baddew_name', currentName); // Update local just in case
                    addLog(`Loaded farm data. Welcome back, ${currentName}!`);
                }

                // Phase 2: Add 1 Baddew Point on load
                gameState.baddewPoints = (gameState.baddewPoints || 0) + 1;
                addLog(`Earned 1 Baddew Point for returning!`);

                // Phase 4: Output Previous Session Report
                if (gameState.lastSessionReport && gameState.lastSessionReport.length > 0) {
                    addLog(`--- Previous Session Summary Starts ---`);
                    // addLog uses prepend (inserts at the top).
                    // By NOT reversing, we prepend sequentially, making the oldest report line at the bottom, and the newest at the top.
                    // Finally we prepend Ends, so Ends is at the very top.
                    gameState.lastSessionReport.forEach(rep => addLog(rep));
                    addLog(`--- Previous Session Summary Ends ---`);
                    delete gameState.lastSessionReport; // Clear it so it's not shown again
                }

                updateUIForGameplay();
                
            } catch (error) {
                console.error("Load error:", error);
                alert("Failed to load save data. File might be corrupted.");
            }
        };
        reader.readAsText(file);
        
        // Reset input to allow reloading the same file if needed
        event.target.value = '';
    });

    // 4. Save & Export
    btnSaveExport.addEventListener('click', () => {
        if (!gameState) return;

        // Phase 4: Compile Session Report
        let reportStrings = [];
        for (const [actionType, crops] of Object.entries(sessionActions)) {
            for (const [cropType, count] of Object.entries(crops)) {
                if (count > 0) {
                    let verb = actionType === 'watered' ? 'watered' : actionType; 
                    let timesStr = actionType === 'watered' ? `${count} times` : `x ${count}`;
                    reportStrings.push(`${currentName} ${verb} ${cropType} ${timesStr}!`);
                }
            }
        }
        if (reportStrings.length > 0) {
            gameState.lastSessionReport = reportStrings;
        }

        const jsonString = JSON.stringify(gameState, null, 2);
        const base64String = btoa(encodeURIComponent(jsonString));
        const blob = new Blob([base64String], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'baddew-farm-save-data.bfsav';
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        addLog(`Farm data saved and exported.`);
        
        // Reload to reset the app completely after a short delay
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    });

    // 5. Post Chat Message (Phase 2)
    const btnPostChat = document.getElementById('btn-post-chat');
    const inputChat = document.getElementById('chat-input');
    
    btnPostChat.addEventListener('click', () => {
        if (hasPostedThisSession) return;
        
        const text = inputChat.value.trim();
        if (!text) return;

        // Add message (newest at the end for rendering, or shift to start)
        // Let's use push and let renderChatMessages handle it (top to bottom)
        gameState.chatMessages.push({
            author: currentName,
            text: text
        });

        // FIFO max 3
        if (gameState.chatMessages.length > 3) {
            gameState.chatMessages.shift();
        }

        // Add point
        gameState.baddewPoints = (gameState.baddewPoints || 0) + 1;
        
        // Disable UI
        hasPostedThisSession = true;
        inputChat.disabled = true;
        btnPostChat.disabled = true;
        inputChat.value = '';

        // Render updates
        renderPoints();
        renderChatMessages();
        addLog(`Posted to chat and earned 1 Baddew Point.`);
    });

    // 6. Farm Action Buttons (Phase 4 Logic)
    let isActionLocked = false;
    
    function withActionLock(actionFn) {
        if (isActionLocked) return;
        isActionLocked = true;
        
        actionFn();
        
        // Disable buttons visually
        const btns = document.querySelectorAll('.farm-btn');
        btns.forEach(btn => btn.style.opacity = '0.5');

        setTimeout(() => {
            isActionLocked = false;
            btns.forEach(btn => btn.style.opacity = '1');
        }, 500); // 500ms debounce
    }

    document.getElementById('btn-action-plant').addEventListener('click', () => {
        withActionLock(() => {
            if (selectedSlotIndex === null) return alert("Please select a grid slot first.");
            
            let slot = gameState.farmGrid[selectedSlotIndex];
            if (slot.growthStage !== 0) return alert("This slot is not empty.");

            slot.growthStage = 1;
            slot.waterCount = 0;
            slot.plantedBy = currentName;
            
            addLog(`Planted ${slot.cropType}.`);
            handleActionSuccess('planted', slot.cropType);
            renderFarmGrid();
        });
    });

    document.getElementById('btn-action-water').addEventListener('click', () => {
        withActionLock(() => {
            if (selectedSlotIndex === null) return alert("Please select a grid slot first.");
            
            let slot = gameState.farmGrid[selectedSlotIndex];
            if (slot.growthStage !== 1 && slot.growthStage !== 2) {
                return alert("This crop doesn't need water right now.");
            }

            slot.waterCount += 1;
            
            // Determine required waters based on who planted it
            let requiredWaters = (slot.plantedBy === currentName) ? 2 : 1;
            
            if (slot.waterCount >= requiredWaters) {
                slot.growthStage += 1;
                slot.waterCount = 0;
                addLog(`Watered ${slot.cropType}. It grew!`);
            } else {
                addLog(`Watered ${slot.cropType}. Needs ${requiredWaters - slot.waterCount} more.`);
            }

            handleActionSuccess('watered', slot.cropType);
            renderFarmGrid();
        });
    });

    document.getElementById('btn-action-harvest').addEventListener('click', () => {
        withActionLock(() => {
            if (selectedSlotIndex === null) return alert("Please select a grid slot first.");
            
            let slot = gameState.farmGrid[selectedSlotIndex];
            if (slot.growthStage !== 3) return alert("This crop is not ready to harvest.");

            addLog(`Harvested ${slot.cropType}!`);
            
            slot.growthStage = 0;
            slot.waterCount = 0;
            slot.plantedBy = null;
            
            handleActionSuccess('harvested', slot.cropType);
            renderFarmGrid();
        });
    });
});
