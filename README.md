# Baddew Farm 🚜

Baddew Farm is an asynchronous multiplayer browser game where you play by directly sharing your "save data" (a JSON file) with friends via WhatsApp, Email, or any messaging app.

No backend servers, no complex databases. Just pure HTML, CSS, Vanilla JS, and manual file sharing!

---

## 🌟 Game Features

### 🥔 1. Farm & Grow Crops
- You have a 3x3 grid to grow three types of crops: Potatoes, Carrots, and the original "Mish-Mash Seeds".
- Plant seeds, water them, and harvest! 
- **Co-op Bonus:** If you water a crop that *you* planted, it takes 2 waters to grow. But if you water a crop that a *friend* planted in a previous session, it only takes 1 water! Help each other out.

### 💬 2. Chat Board
- A retro cafe-style chalkboard to leave messages for the next player.
- You can post 1 message per session.
- The board holds the latest 3 messages (older messages are pushed out automatically).

### 🏆 3. Baddew Points
- A shared score for your friend group!
- Earn 1 point every time you load the game.
- Earn 1 point for posting on the Chat Board.
- Earn 1 point for every 10 farming actions (planting, watering, harvesting) you do individually.

### 📋 4. Session Reports
- Every time you load a friend's save file, you'll see a summary of exactly what they did in their last session!

---

## 🎮 How to Play

### 1. Start a New Farm or Load an Existing One
- **New Game:** Open `index.html`, enter your name, and click "Start New Game".
- **Load Game:** If a friend sent you a `baddew-farm-save-data.json` file, click "Load Game (JSON)" and select it.

### 2. Play Your Turn
- Post a message on the Chat Board.
- Tend to the farm (Plant, Water, Harvest).
- Watch your Baddew Points grow!

### 3. Save & Export
- Once you're done playing for the moment, click the **"Save & Export"** button at the top of the screen.
- This will compile your actions into a report, save the game state, and download a new `baddew-farm-save-data.json` file to your device.

### 4. Pass the Turn
- Send the newly downloaded JSON file to your friend. It's their turn to load it and play!
