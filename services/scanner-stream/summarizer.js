const OpenAI = require('openai');

class SummarizerService {
  constructor(apiKey) {
    this.enabled = !!apiKey;
    
    if (this.enabled) {
      this.openai = new OpenAI({
        apiKey: apiKey
      });
      console.log('AI Summarizer service initialized');
    } else {
      console.log('AI Summarizer disabled - no API key');
    }
  }

  async summarizeTranscription(transcription, transmissionData) {
    if (!this.enabled) {
      return this.mockSummarize(transcription, transmissionData);
    }

    try {
      const prompt = `You are a local news AI assistant analyzing police scanner transcriptions for Sandusky, Ohio.

Transcription: "${transcription.text}"
Unit: ${transmissionData.unit}
Type: ${transmissionData.type}

Analyze this transcription and return a JSON response with:
1. "worthPosting": boolean - true if this is newsworthy (accidents, fires, arrests, public safety issues), false if routine/administrative
2. "summary": string - IF worth posting, a brief 1-2 sentence public-friendly summary. If NOT worth posting, return null
3. "severity": string - "low", "medium", "high", or "critical"
4. "category": string - "traffic", "fire", "medical", "crime", "accident", "other"
5. "location": string or null - extracted location if mentioned
6. "socialMedia": string or null - IF worth posting, a tweet-length version (under 280 chars) for social media

Examples of NOT worth posting: routine traffic stops, meal breaks, administrative chatter, test messages
Examples of worth posting: accidents with injuries, structure fires, arrests, public safety threats

Return ONLY valid JSON.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 200
      });

      const result = JSON.parse(response.choices[0].message.content);
      
      return {
        id: transcription.id,
        ...result,
        timestamp: new Date().toISOString(),
        transcriptionId: transcription.id
      };
    } catch (error) {
      console.error('Summarization error:', error);
      return this.mockSummarize(transcription, transmissionData);
    }
  }

  mockSummarize(transcription, transmissionData) {
    // Simulate intelligent filtering
    const worthPostingPhrases = [
      'accident', 'fire', 'smoke', 'injury', 'transport', 'custody', 
      'backup', 'emergency', 'responding', 'on scene'
    ];
    
    const routinePhrases = [
      'clear', 'returning', 'false alarm', 'nothing showing', 
      'refusal', 'station', 'under control'
    ];
    
    const text = transcription.text.toLowerCase();
    
    // Check if worth posting
    const hasNewsworthyContent = worthPostingPhrases.some(phrase => text.includes(phrase));
    const isRoutine = routinePhrases.some(phrase => text.includes(phrase));
    const worthPosting = hasNewsworthyContent && !isRoutine;

    // Generate appropriate response based on worth
    if (!worthPosting) {
      return {
        id: transcription.id,
        worthPosting: false,
        summary: null,
        severity: 'low',
        category: 'other',
        location: null,
        socialMedia: null,
        timestamp: new Date().toISOString(),
        transcriptionId: transcription.id
      };
    }

    // Generate mock summaries for newsworthy items
    const summaries = {
      'accident': {
        summary: 'Emergency units responding to vehicle accident in the area.',
        severity: 'medium',
        category: 'accident',
        socialMedia: '🚨 Emergency units responding to vehicle accident in Sandusky area. Drive safely and expect delays.'
      },
      'fire': {
        summary: 'Fire department responding to reported fire alarm activation.',
        severity: 'high',
        category: 'fire',
        socialMedia: '🚒 Fire units responding to alarm in Sandusky. Please avoid the area if possible.'
      },
      'medical': {
        summary: 'EMS units providing medical assistance and transport.',
        severity: 'medium',
        category: 'medical',
        socialMedia: '🚑 EMS responding to medical emergency in Sandusky area.'
      },
      'custody': {
        summary: 'Law enforcement has taken a subject into custody following an incident.',
        severity: 'medium',
        category: 'crime',
        socialMedia: '👮 Subject in custody following police response in Sandusky. No ongoing threat.'
      }
    };

    // Pick appropriate summary based on content
    let selectedSummary = summaries['accident']; // default
    
    if (text.includes('fire') || text.includes('smoke')) {
      selectedSummary = summaries['fire'];
    } else if (text.includes('medical') || text.includes('transport')) {
      selectedSummary = summaries['medical'];
    } else if (text.includes('custody') || text.includes('arrest')) {
      selectedSummary = summaries['custody'];
    }

    // Try to extract location
    const locationPatterns = [
      /at (.+?)(?:\.|,|$)/i,
      /responding to (.+?)(?:\.|,|$)/i,
      /location:? (.+?)(?:\.|,|$)/i
    ];
    
    let location = null;
    for (const pattern of locationPatterns) {
      const match = transcription.text.match(pattern);
      if (match) {
        location = match[1].trim();
        break;
      }
    }

    return {
      id: transcription.id,
      worthPosting: true,
      summary: selectedSummary.summary,
      severity: selectedSummary.severity,
      category: selectedSummary.category,
      location: location,
      socialMedia: selectedSummary.socialMedia,
      timestamp: new Date().toISOString(),
      transcriptionId: transcription.id,
      isMock: true
    };
  }
}

module.exports = SummarizerService;