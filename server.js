// ===========================================
// EVEREST SPORTS FESTIVAL - LIVE BACKEND SERVER
// Deploy on Railway for 24/7 operation
// ===========================================

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Data file path
const DATA_FILE = path.join(__dirname, 'sports-data.json');

// Default data
const defaultData = {
    scores: {
        white: 12,
        marron: 15,
        blue: 10,
        yellow: 8
    },
    matches: {
        match1: { team1: 'MARRON', team2: 'BLUE', score1: 2, score2: 1, status: 'live' },
        match2: { team1: 'WHITE', team2: 'YELLOW', score1: 0, score2: 0, status: 'upcoming' },
        match3: { team1: 'WINNER SF1', team2: 'WINNER SF2', score1: 0, score2: 0, status: 'finals' }
    },
    lastUpdated: new Date().toISOString()
};

// Load data from file
function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            return data;
        }
    } catch (err) {
        console.log('Creating new data file...');
    }
    return defaultData;
}

// Save data to file
function saveData(data) {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('✅ Data saved:', new Date().toLocaleTimeString());
}

// ========== API ROUTES ==========

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        server: 'Everest Sports Festival Live',
        time: new Date().toISOString()
    });
});

// GET current scores and matches (PUBLIC)
app.get('/api/sports-data', (req, res) => {
    const data = loadData();
    res.json(data);
});

// UPDATE scores (ADMIN ONLY - with password)
app.post('/api/update-scores', (req, res) => {
    const { password, scores } = req.body;
    
    // Simple password protection (CHANGE THIS!)
    if (password !== 'everest2026') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const data = loadData();
    data.scores = scores;
    saveData(data);
    
    res.json({ success: true, message: 'Scores updated', data: data });
});

// UPDATE matches (ADMIN ONLY)
app.post('/api/update-matches', (req, res) => {
    const { password, matches } = req.body;
    
    if (password !== 'everest2026') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const data = loadData();
    data.matches = matches;
    saveData(data);
    
    res.json({ success: true, message: 'Matches updated', data: data });
});

// UPDATE specific match (ADMIN ONLY)
app.post('/api/update-match/:matchId', (req, res) => {
    const { password } = req.body;
    const matchId = req.params.matchId;
    
    if (password !== 'everest2026') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const data = loadData();
    data.matches[matchId] = req.body.match;
    saveData(data);
    
    res.json({ success: true, message: `Match ${matchId} updated` });
});

// RESET all data (ADMIN ONLY)
app.post('/api/reset-data', (req, res) => {
    const { password } = req.body;
    
    if (password !== 'everest2026') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    saveData(defaultData);
    res.json({ success: true, message: 'Data reset to default' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 EVEREST SPORTS FESTIVAL LIVE SERVER');
    console.log('='.repeat(50));
    console.log(`📍 Port: ${PORT}`);
    console.log(`📍 Public API: http://localhost:${PORT}/api/sports-data`);
    console.log(`📍 Admin updates: POST /api/update-scores`);
    console.log('='.repeat(50) + '\n');
});
