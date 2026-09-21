document.addEventListener('DOMContentLoaded', () => {
    const dataInput = document.getElementById('dataInput');
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');
    const fileInput = document.getElementById('fileInput');
    const dataDisplay = document.getElementById('dataDisplay');

    // ==========================================
    // 1. Save Data Locally
    // ==========================================
    saveBtn.addEventListener('click', () => {
        const textToSave = dataInput.value;
        
        // Create JSON object
        const saveData = {
            savedText: textToSave,
            timestamp: new Date().toISOString()
        };

        // Convert to JSON string
        const jsonString = JSON.stringify(saveData, null, 2);
        
        // Create Blob object (MIME type application/json)
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // Generate download URL from Blob
        const url = URL.createObjectURL(blob);
        
        // Create dummy anchor tag to force download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'baddew-farm-save-data.json';
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // ==========================================
    // 2. Load Save Data
    // ==========================================
    
    // Trigger hidden file input on Load button click
    loadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle file selection
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        // On load success
        reader.onload = (e) => {
            try {
                // Parse file content as JSON
                const loadedData = JSON.parse(e.target.result);
                
                // Extract and display specific property if available
                if (loadedData && loadedData.savedText !== undefined) {
                    dataDisplay.textContent = loadedData.savedText;
                } else {
                    dataDisplay.textContent = 'Error: No valid save data found.';
                }
            } catch (error) {
                console.error("JSON parse error:", error);
                dataDisplay.textContent = 'Error: Failed to parse JSON file.';
            }
        };

        // On load error
        reader.onerror = () => {
            dataDisplay.textContent = 'Error: Problem occurred while reading the file.';
        };

        // Start reading file as text
        reader.readAsText(file);
        
        // Reset input value to allow consecutive identical file loading
        event.target.value = '';
    });
});
