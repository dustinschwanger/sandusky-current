const fs = require('fs');
const path = require('path');

class AudioRecorder {
  constructor() {
    this.recording = false;
    this.chunks = [];
    this.recordingStartTime = null;
    this.recordingsDir = path.join(__dirname, 'recordings');
    
    // Create recordings directory if it doesn't exist
    if (!fs.existsSync(this.recordingsDir)) {
      fs.mkdirSync(this.recordingsDir, { recursive: true });
      console.log('Created recordings directory');
    }
  }

  startRecording(transmissionId) {
    this.recording = true;
    this.chunks = [];
    this.recordingStartTime = Date.now();
    this.currentTransmissionId = transmissionId;
    console.log(`Started recording transmission: ${transmissionId}`);
  }

  addChunk(data) {
    if (this.recording) {
      this.chunks.push(data);
    }
  }

  async stopRecording() {
    if (!this.recording) return null;
    
    this.recording = false;
    const duration = (Date.now() - this.recordingStartTime) / 1000;
    
    // Save the recording
    const filename = `${this.currentTransmissionId}_${Date.now()}.mp3`;
    const filepath = path.join(this.recordingsDir, filename);
    
    // For now, create a placeholder file (since we're using mock audio)
    const metadata = {
      id: this.currentTransmissionId,
      filename: filename,
      duration: duration,
      timestamp: new Date().toISOString(),
      size: this.chunks.length
    };
    
    // Save metadata
    fs.writeFileSync(
      filepath.replace('.mp3', '.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    console.log(`Saved recording: ${filename} (${duration.toFixed(1)}s)`);
    
    this.chunks = [];
    this.currentTransmissionId = null;
    
    return metadata;
  }

  getRecordings() {
    try {
      const files = fs.readdirSync(this.recordingsDir);
      const recordings = files
        .filter(f => f.endsWith('.json'))
        .map(f => {
          const content = fs.readFileSync(path.join(this.recordingsDir, f), 'utf8');
          return JSON.parse(content);
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return recordings;
    } catch (error) {
      console.error('Error reading recordings:', error);
      return [];
    }
  }

  cleanOldRecordings(hoursToKeep = 24) {
    const cutoffTime = Date.now() - (hoursToKeep * 60 * 60 * 1000);
    const files = fs.readdirSync(this.recordingsDir);
    
    files.forEach(file => {
      const filepath = path.join(this.recordingsDir, file);
      const stats = fs.statSync(filepath);
      
      if (stats.mtimeMs < cutoffTime) {
        fs.unlinkSync(filepath);
        console.log(`Deleted old recording: ${file}`);
      }
    });
  }
}

module.exports = AudioRecorder;