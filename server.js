// ===========================================
// EVEREST YOUTH ACADEMY - COMPLETE BACKEND
// LIVE ON RENDER - ALL ROUTES WORKING!
// ===========================================

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(express.json());

// ========== DATA STORAGE ==========
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

// Load data function
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

// Save data function
function saveData(data) {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('✅ Data saved:', new Date().toLocaleTimeString());
}

// ========== ROOT ROUTE - THIS FIXES THE 404! ==========
app.get('/', (req, res) => {
    res.json({
        name: 'Everest Youth Academy API',
        status: 'running',
        message: 'Welcome to Everest Youth Academy Backend!',
        endpoints: {
            health: '/health',
            sportsData: '/api/sports-data',
            website: 'https://toticr183-dev.github.io/Everest-youth-acadamey/'
        },
        server: 'Render',
        timestamp: new Date().toISOString()
    });
});

// ========== HEALTH CHECK ==========
app.get('/health', (req, res) => {
    const data = loadData();
    res.json({
        status: 'healthy',
        server: 'Everest Youth Academy Live',
        appointments: data.scores || 'Sports data ready',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

// ========== GET SPORTS DATA ==========
app.get('/api/sports-data', (req, res) => {
    const data = loadData();
    res.json(data);
});

// ========== UPDATE SCORES ==========
app.post('/api/update-scores', (req, res) => {
    const { password, scores } = req.body;
    
    // Simple password (CHANGE THIS!)
    if (password !== 'everest2026') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const data = loadData();
    data.scores = scores;
    saveData(data);
    
    res.json({ success: true, message: 'Scores updated', data: data });
});

// ========== UPDATE MATCHES ==========
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

// ========== UPDATE SINGLE MATCH ==========
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

// ========== RESET DATA ==========
app.post('/api/reset-data', (req, res) => {
    const { password } = req.body;
    
    if (password !== 'everest2026') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    saveData(defaultData);
    res.json({ success: true, message: 'Data reset to default' });
});

// ========== 404 HANDLER FOR ANY OTHER ROUTES ==========
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: 'The requested endpoint does not exist',
        available: ['/', '/health', '/api/sports-data']
    });
});

// ========== START SERVER ==========
app.listen(PORT, '0.0.0.0', () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 EVEREST YOUTH ACADEMY BACKEND RUNNING!');
    console.log('='.repeat(60));
    console.log(`📍 Port: ${PORT}`);
    console.log(`📍 Root: https://everest-youth-academy.onrender.com/`);
    console.log(`📍 Health: /health`);
    console.log(`📍 Sports Data: /api/sports-data`);
    console.log('='.repeat(60));
    console.log('✅ Server ready for requests!');
    console.log('='.repeat(60) + '\n');
});
