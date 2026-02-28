// ===========================================
// EVEREST YOUTH ACADEMY - COMPLETE FIXED BACKEND
// ALL ENDPOINTS WORKING!
// ===========================================

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'sports-data.json');

// ===== 4 HOUSES × 4 GRADES DATA STRUCTURE =====
const defaultData = {
    houses: {
        maroon: { name: 'MARRON', color: '#800000', icon: '🤎' },
        blue: { name: 'BLUE', color: '#0000ff', icon: '💙' },
        yellow: { name: 'YELLOW', color: '#ffcc00', icon: '💛' },
        white: { name: 'WHITE', color: '#ffffff', icon: '🤍' }
    },
    grades: ['9', '10', '11', '12'],
    competitions: {
        grade9: {
            maroon: { score: 12, wins: 2 },
            blue: { score: 15, wins: 1 },
            yellow: { score: 8, wins: 0 },
            white: { score: 10, wins: 1 }
        },
        grade10: {
            maroon: { score: 10, wins: 1 },
            blue: { score: 12, wins: 2 },
            yellow: { score: 14, wins: 1 },
            white: { score: 9, wins: 0 }
        },
        grade11: {
            maroon: { score: 15, wins: 2 },
            blue: { score: 11, wins: 1 },
            yellow: { score: 13, wins: 1 },
            white: { score: 8, wins: 0 }
        },
        grade12: {
            maroon: { score: 9, wins: 0 },
            blue: { score: 16, wins: 2 },
            yellow: { score: 12, wins: 1 },
            white: { score: 14, wins: 1 }
        }
    },
    currentMatches: {
        grade9: { team1: 'MARRON', team2: 'BLUE', score1: 2, score2: 1, status: 'live' },
        grade10: { team1: 'YELLOW', team2: 'WHITE', score1: 0, score2: 0, status: 'upcoming' },
        grade11: { team1: 'MARRON', team2: 'YELLOW', score1: 3, score2: 2, status: 'finished' },
        grade12: { team1: 'BLUE', team2: 'WHITE', score1: 1, score2: 1, status: 'upcoming' },
        live: 'grade9'
    },
    trophies: {
        grade9: 'blue',
        grade10: 'maroon',
        grade11: 'yellow',
        grade12: null
    },
    lastUpdated: new Date().toISOString()
};

function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        }
    } catch (err) {
        console.log('Creating new data file...');
    }
    return defaultData;
}

function saveData(data) {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('✅ Data saved:', new Date().toLocaleTimeString());
    return data;
}

// ========== ROOT ROUTE ==========
app.get('/', (req, res) => {
    res.json({
        name: 'Everest Sports Festival API',
        description: '4 Houses × 4 Grades Competition',
        endpoints: {
            health: '/health',
            data: '/api/sports-data',
            updateScores: '/api/update-scores (POST)',
            updateMatches: '/api/update-matches (POST)',
            updateTrophies: '/api/update-trophies (POST)',
            resetAll: '/api/reset-all (POST)'
        }
    });
});

// ========== HEALTH CHECK ==========
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        server: 'Everest 4×4 Tournament',
        time: new Date().toISOString()
    });
});

// ========== GET ALL SPORTS DATA ==========
app.get('/api/sports-data', (req, res) => {
    const data = loadData();
    res.json(data);
});

// ========== UPDATE SCORES (FIXED - PLURAL) ==========
app.post('/api/update-scores', (req, res) => {
    const { password, scores } = req.body;
    
    if (password !== 'everest2026') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const data = loadData();
    data.competitions = scores;
    saveData(data);
    
    res.json({ success: true, message: 'Scores updated' });
});

// ========== UPDATE MATCHES (FIXED - PLURAL) ==========
app.post('/api/update-matches', (req, res) => {
    const { password, matches } = req.body;
    
    if (password !== 'everest2026') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const data = loadData();
    data.currentMatches = matches;
    saveData(data);
    
    res.json({ success: true, message: 'Matches updated' });
});

// ========== UPDATE TROPHIES (NEW!) ==========
app.post('/api/update-trophies', (req, res) => {
    const { password, trophies } = req.body;
    
    if (password !== 'everest2026') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const data = loadData();
    data.trophies = trophies;
    saveData(data);
    
    res.json({ success: true, message: 'Trophies updated' });
});

// ========== UPDATE SINGLE SCORE ==========
app.post('/api/update-score', (req, res) => {
    const { password, grade, house, score } = req.body;
    
    if (password !== 'everest2026') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const data = loadData();
    if (data.competitions[`grade${grade}`] && data.competitions[`grade${grade}`][house]) {
        data.competitions[`grade${grade}`][house].score = score;
        saveData(data);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Grade or house not found' });
    }
});

// ========== UPDATE SINGLE MATCH ==========
app.post('/api/update-match', (req, res) => {
    const { password, grade, matchData } = req.body;
    
    if (password !== 'everest2026') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const data = loadData();
    data.currentMatches[`grade${grade}`] = matchData;
    
    if (matchData.status === 'live') {
        data.currentMatches.live = `grade${grade}`;
    }
    
    saveData(data);
    res.json({ success: true });
});

// ========== DECLARE WINNER ==========
app.post('/api/declare-winner', (req, res) => {
    const { password, grade, winningHouse } = req.body;
    
    if (password !== 'everest2026') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const data = loadData();
    data.trophies[`grade${grade}`] = winningHouse;
    
    if (data.competitions[`grade${grade}`] && data.competitions[`grade${grade}`][winningHouse]) {
        data.competitions[`grade${grade}`][winningHouse].wins += 1;
    }
    
    saveData(data);
    res.json({ success: true, message: `${winningHouse} wins Grade ${grade}` });
});

// ========== RESET ALL ==========
app.post('/api/reset-all', (req, res) => {
    const { password } = req.body;
    
    if (password !== 'everest2026') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    saveData(defaultData);
    res.json({ success: true, message: 'Tournament reset' });
});

// ========== 404 HANDLER ==========
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        available: ['/', '/health', '/api/sports-data']
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 EVEREST 4×4 TOURNAMENT SERVER');
    console.log('='.repeat(60));
    console.log(`📍 Port: ${PORT}`);
    console.log(`📍 All endpoints ready!`);
    console.log('📍 POST /api/update-scores');
    console.log('📍 POST /api/update-matches');
    console.log('📍 POST /api/update-trophies');
    console.log('='.repeat(60) + '\n');
});
