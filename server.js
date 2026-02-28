// ===========================================
// EVEREST YOUTH ACADEMY - 4 HOUSES × 4 GRADES
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
            maroon: { score: 0, wins: 0, matches: [] },
            blue: { score: 0, wins: 0, matches: [] },
            yellow: { score: 0, wins: 0, matches: [] },
            white: { score: 0, wins: 0, matches: [] }
        },
        grade10: {
            maroon: { score: 0, wins: 0, matches: [] },
            blue: { score: 0, wins: 0, matches: [] },
            yellow: { score: 0, wins: 0, matches: [] },
            white: { score: 0, wins: 0, matches: [] }
        },
        grade11: {
            maroon: { score: 0, wins: 0, matches: [] },
            blue: { score: 0, wins: 0, matches: [] },
            yellow: { score: 0, wins: 0, matches: [] },
            white: { score: 0, wins: 0, matches: [] }
        },
        grade12: {
            maroon: { score: 0, wins: 0, matches: [] },
            blue: { score: 0, wins: 0, matches: [] },
            yellow: { score: 0, wins: 0, matches: [] },
            white: { score: 0, wins: 0, matches: [] }
        }
    },
    currentMatches: {
        grade9: { match: 'Maroon vs Blue', score1: 0, score2: 0, status: 'upcoming' },
        grade10: { match: 'Yellow vs White', score1: 0, score2: 0, status: 'upcoming' },
        grade11: { match: 'Maroon vs Yellow', score1: 0, score2: 0, status: 'upcoming' },
        grade12: { match: 'Blue vs White', score1: 0, score2: 0, status: 'upcoming' },
        live: null // which grade is currently live
    },
    trophies: {
        grade9: null, // winning house
        grade10: null,
        grade11: null,
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
}

// ========== ROOT ROUTE ==========
app.get('/', (req, res) => {
    res.json({
        name: 'Everest Sports Festival',
        description: '4 Houses × 4 Grades Competition',
        endpoints: {
            health: '/health',
            data: '/api/sports-data',
            update: '/api/update (POST)',
            reset: '/api/reset (POST)'
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

// ========== UPDATE SCORES ==========
app.post('/api/update-score', (req, res) => {
    const { password, grade, house, scoreChange } = req.body;
    
    if (password !== 'everest2026') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const data = loadData();
    const competition = data.competitions[`grade${grade}`];
    
    if (competition && competition[house]) {
        competition[house].score = Math.max(0, competition[house].score + scoreChange);
        saveData(data);
        res.json({ success: true, data: competition[house] });
    } else {
        res.status(404).json({ error: 'Grade or house not found' });
    }
});

// ===== UPDATE MATCH =====
app.post('/api/update-match', (req, res) => {
    const { password, grade, matchData } = req.body;
    
    if (password !== 'everest2026') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const data = loadData();
    data.currentMatches[`grade${grade}`] = matchData;
    
    // If this match is set to live, update the live indicator
    if (matchData.status === 'live') {
        data.currentMatches.live = `grade${grade}`;
    }
    
    saveData(data);
    res.json({ success: true });
});

// ===== DECLARE WINNER =====
app.post('/api/declare-winner', (req, res) => {
    const { password, grade, winningHouse } = req.body;
    
    if (password !== 'everest2026') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const data = loadData();
    data.trophies[`grade${grade}`] = winningHouse;
    
    // Add win count to the house
    if (data.competitions[`grade${grade}`] && data.competitions[`grade${grade}`][winningHouse]) {
        data.competitions[`grade${grade}`][winningHouse].wins += 1;
    }
    
    saveData(data);
    res.json({ success: true, message: `${winningHouse} wins Grade ${grade}!` });
});

// ===== RESET GRADE =====
app.post('/api/reset-grade', (req, res) => {
    const { password, grade } = req.body;
    
    if (password !== 'everest2026') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const data = loadData();
    
    // Reset all houses for this grade
    ['maroon', 'blue', 'yellow', 'white'].forEach(house => {
        data.competitions[`grade${grade}`][house] = { score: 0, wins: 0, matches: [] };
    });
    
    data.currentMatches[`grade${grade}`] = { 
        match: 'TBD vs TBD', 
        score1: 0, 
        score2: 0, 
        status: 'upcoming' 
    };
    
    data.trophies[`grade${grade}`] = null;
    
    saveData(data);
    res.json({ success: true, message: `Grade ${grade} reset` });
});

// ===== RESET ALL =====
app.post('/api/reset-all', (req, res) => {
    const { password } = req.body;
    
    if (password !== 'everest2026') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    saveData(defaultData);
    res.json({ success: true, message: 'Complete tournament reset' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 EVEREST 4×4 TOURNAMENT SERVER');
    console.log('='.repeat(60));
    console.log('📍 4 Houses × 4 Grades = 16 Competitions');
    console.log('📍 Maroon | Blue | Yellow | White');
    console.log('📍 Grade 9 | 10 | 11 | 12');
    console.log('='.repeat(60));
    console.log(`📍 Port: ${PORT}`);
    console.log('📍 API: /api/sports-data');
    console.log('='.repeat(60) + '\n');
});
