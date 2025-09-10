const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

class TranscriptionService {
  constructor(apiKey) {
    this.enabled = !!apiKey;
    
    if (this.enabled) {
      this.openai = new OpenAI({
        apiKey: apiKey
      });
      console.log('Whisper transcription service initialized');
    } else {
      console.log('Whisper transcription disabled - no API key');
    }
    
    this.transcriptionsDir = path.join(__dirname, 'transcriptions');
    
    // Create transcriptions directory if it doesn't exist
    if (!fs.existsSync(this.transcriptionsDir)) {
      fs.mkdirSync(this.transcriptionsDir, { recursive: true });
    }
  }

  async transcribeAudio(audioFilePath, transmissionId) {
    if (!this.enabled) {
      // Return mock transcription for testing
      return this.mockTranscription(transmissionId);
    }

    try {
      console.log(`Transcribing audio: ${audioFilePath}`);
      
      const audioFile = fs.createReadStream(audioFilePath);
      const response = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        response_format: 'json',
        language: 'en'
      });

      const transcription = {
        id: transmissionId,
        text: response.text,
        timestamp: new Date().toISOString(),
        confidence: 0.95, // Whisper doesn't provide confidence, using placeholder
        duration: null // Will be set by caller
      };

      // Save transcription
      this.saveTranscription(transcription);
      
      return transcription;
    } catch (error) {
      console.error('Transcription error:', error);
      return this.mockTranscription(transmissionId);
    }
  }

  mockTranscription(transmissionId) {
    // Generate mock transcription based on transmission ID
    const mockTexts = [
      "Unit 12 responding to traffic accident at intersection",
      "Engine 3 on scene, smoke showing from second floor",
      "Medic 1 transporting patient, ETA 5 minutes",
      "All units clear, returning to station",
      "Request additional backup at location",
      "Subject in custody, no injuries reported",
      "Fire under control, beginning overhaul",
      "Cancel response, false alarm confirmed"
    ];
    
    const text = mockTexts[Math.floor(Math.random() * mockTexts.length)];
    
    const transcription = {
      id: transmissionId,
      text: text,
      timestamp: new Date().toISOString(),
      confidence: 0.85,
      duration: 3 + Math.random() * 5,
      isMock: true
    };

    this.saveTranscription(transcription);
    return transcription;
  }

  saveTranscription(transcription) {
    const filename = `${transcription.id}_transcript.json`;
    const filepath = path.join(this.transcriptionsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(transcription, null, 2));
    console.log(`Saved transcription: ${filename}`);
  }

  getTranscriptions(limit = 50) {
    try {
      const files = fs.readdirSync(this.transcriptionsDir);
      const transcriptions = files
        .filter(f => f.endsWith('_transcript.json'))
        .map(f => {
          const content = fs.readFileSync(path.join(this.transcriptionsDir, f), 'utf8');
          return JSON.parse(content);
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
      
      return transcriptions;
    } catch (error) {
      console.error('Error reading transcriptions:', error);
      return [];
    }
  }

  cleanOldTranscriptions(hoursToKeep = 24) {
    const cutoffTime = Date.now() - (hoursToKeep * 60 * 60 * 1000);
    const files = fs.readdirSync(this.transcriptionsDir);
    
    files.forEach(file => {
      const filepath = path.join(this.transcriptionsDir, file);
      const stats = fs.statSync(filepath);
      
      if (stats.mtimeMs < cutoffTime) {
        fs.unlinkSync(filepath);
        console.log(`Deleted old transcription: ${file}`);
      }
    });
  }
}

module.exports = TranscriptionService;