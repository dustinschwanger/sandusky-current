require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const { generateMockTransmission } = require('./mock-scanner');
const AudioStreamManager = require('./audio-stream');
const AudioRecorder = require('./recorder');
const TranscriptionService = require('./transcriber');
const SummarizerService = require('./summarizer');
const SocialMediaService = require('./social-media');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Enable CORS for the Next.js app
app.use(cors());
app.use(express.json());

// Store connected clients
const clients = new Set();
const audioManager = new AudioStreamManager();
const recorder = new AudioRecorder();
const transcriber = new TranscriptionService(process.env.OPENAI_API_KEY);
const summarizer = new SummarizerService(process.env.OPENAI_API_KEY);
const socialMedia = new SocialMediaService(process.env.PUBLER_API_KEY, process.env.PUBLER_WORKSPACE_ID);

// Broadcast to all connected clients
function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New client connected');
  clients.add(ws);

  // Send welcome message
  ws.send(JSON.stringify({ 
    type: 'connection', 
    message: 'Connected to scanner stream' 
  }));

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Generate mock transmissions every 5-15 seconds
function startMockTransmissions() {
  setInterval(() => {
    const transmission = generateMockTransmission();
    console.log('Broadcasting:', transmission.message);
    
    // Start recording for this transmission
    recorder.startRecording(transmission.id);
    
    // Simulate recording for 3-5 seconds
    setTimeout(async () => {
    const metadata = await recorder.stopRecording();
    if (metadata) {
        // Broadcast recording completed
        broadcast({ 
        type: 'recording_saved', 
        data: metadata 
        });
        
        // Transcribe the recording
        const transcription = await transcriber.mockTranscription(transmission.id);
        transcription.duration = metadata.duration;
        
        // Broadcast transcription
        broadcast({
        type: 'transcription_complete',
        data: transcription
        });
        
        // Summarize the transcription
        const summary = await summarizer.summarizeTranscription(transcription, transmission);
        
        // Only broadcast if worth posting
        if (summary.worthPosting) {
        console.log(`Newsworthy incident: ${summary.category} - ${summary.summary}`);
        broadcast({
            type: 'incident_summary',
            data: summary
        });
        // Queue for social media if it meets criteria
        if (socialMedia.shouldPost(summary)) {
            socialMedia.postToSocialMedia(summary);
        }
        } else {
        console.log(`Filtered out routine chatter: ${transcription.text.substring(0, 50)}...`);
        }
    }
    }, 3000 + Math.random() * 2000);
    
    // Broadcast the transmission
    broadcast({ type: 'transmission', data: transmission });
  }, 5000 + Math.random() * 10000);
}

// Audio stream endpoint
app.get('/stream', (req, res) => {
  audioManager.addClient(res);
  audioManager.startMockStream();
});

// Get recordings endpoint
app.get('/recordings', (req, res) => {
  const recordings = recorder.getRecordings();
  res.json(recordings);
});

// Get transcriptions endpoint
app.get('/transcriptions', (req, res) => {
  const transcriptions = transcriber.getTranscriptions();
  res.json(transcriptions);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    wsClients: clients.size,
    audioClients: audioManager.getClientCount(),
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Scanner service running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
  startMockTransmissions();
  console.log('Mock transmissions started');
  
  // Clean old recordings every hour
  setInterval(() => {
    recorder.cleanOldRecordings(24);
    transcriber.cleanOldTranscriptions(24);
  }, 60 * 60 * 1000);
});