import { createServer } from 'http';
import { OBSWebSocket } from 'obs-websocket-js';

// Config for HTTP server
const host = '0.0.0.0';
const port = 5300;

let currentPlayer;
let obsConnected = false;

const obs = new OBSWebSocket();
obs.connect().then(() => {
    console.log('Connected to OBS WebSocket');
    obsConnected = true;
}).catch(err => {
    console.error('Failed to connect to OBS WebSocket:', err);
});

function handleGamestate(data) {
    if (!obsConnected || !data.player?.steamid) {
        return;
    }

    if (currentPlayer !== steamId) {
        currentPlayer = steamId;
        obs.send('SetCurrentScene', { 'scene-name': data.player.steamid });
    }
}

// HTTP server receives gamestate data from CS2
// https://www.reddit.com/r/GlobalOffensive/comments/cjhcpy/game_state_integration_a_very_large_and_indepth/
// We're only interested in data.player.steamid
const server = createServer((req, res) => {
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk; 
        });
        req.on('end', () => {
            handleGamestate(JSON.parse(body));
        });
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('');
});

server.listen(port, host, () => {
    console.log(`Gamestate server running at http://${host}:${port}/`);
});