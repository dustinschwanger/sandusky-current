const fs = require('fs');
const path = require('path');

class AudioStreamManager {
  constructor() {
    this.clients = new Set();
    this.isStreaming = false;
    this.audioBuffer = [];
  }

  addClient(res) {
    // Set headers for audio streaming
    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    this.clients.add(res);
    console.log(`Audio client connected. Total clients: ${this.clients.size}`);

    // Clean up on disconnect
    res.on('close', () => {
      this.clients.delete(res);
      console.log(`Audio client disconnected. Total clients: ${this.clients.size}`);
    });
  }

  broadcast(chunk) {
    this.clients.forEach(client => {
      try {
        client.write(chunk);
      } catch (error) {
        console.error('Error broadcasting to client:', error);
        this.clients.delete(client);
      }
    });
  }

  // Simulate audio data for testing (silence)
  startMockStream() {
    if (this.isStreaming) return;
    
    this.isStreaming = true;
    console.log('Starting mock audio stream');

    // Send silent MP3 frames periodically
    // This is a minimal MP3 frame representing silence
    const silentFrame = Buffer.from([
      0xFF, 0xFB, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);

    const interval = setInterval(() => {
      if (this.clients.size === 0) {
        clearInterval(interval);
        this.isStreaming = false;
        console.log('Stopping mock audio stream - no clients');
        return;
      }

      this.broadcast(silentFrame);
    }, 100);
  }

  getClientCount() {
    return this.clients.size;
  }
}

module.exports = AudioStreamManager;