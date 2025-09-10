class SocialMediaService {
  constructor(publerApiKey, workspaceId) {
    this.publerApiKey = publerApiKey;
    this.workspaceId = workspaceId || '68c1c56eef0ed7e2cb6e1e68';
    this.enabled = !!publerApiKey;
    
    if (this.enabled) {
      console.log('Social media service initialized with Publer');
    } else {
      console.log('Social media posting disabled - no Publer API key');
    }
    
    // Track posted items to avoid duplicates
    this.postedIds = new Set();
    this.postQueue = [];
    this.isPosting = false;
  }

  async postToSocialMedia(summary) {
    // Skip if already posted or not worth posting
    if (!summary.worthPosting || !summary.socialMedia || this.postedIds.has(summary.id)) {
      return null;
    }

    // Add to queue
    this.postQueue.push(summary);
    this.postedIds.add(summary.id);
    
    // Process queue if not already processing
    if (!this.isPosting) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.postQueue.length === 0) {
      this.isPosting = false;
      return;
    }

    this.isPosting = true;
    const summary = this.postQueue.shift();

    try {
      if (this.enabled) {
        await this.postToPubler(summary);
      } else {
        await this.mockPost(summary);
      }
      
      // Rate limiting - wait 30 seconds between posts
      setTimeout(() => {
        this.processQueue();
      }, 30000);
    } catch (error) {
      console.error('Error posting to social media:', error);
      // Continue processing queue even if one fails
      setTimeout(() => {
        this.processQueue();
      }, 5000);
    }
  }

  async postToPubler(summary) {
    // Publer API endpoint for creating posts
    const publerApiUrl = `https://api.publer.io/v1/workspaces/${this.workspaceId}/posts`;
    
    // Add hashtags and link
    const hashtags = this.getHashtags(summary.category, summary.severity);
    const link = 'https://sanduskycurrent.com';
    
    // Create post content for different platforms
    const postContent = {
      text: `${summary.socialMedia} ${hashtags}`,
      link: link,
      media: [] // Could add images later
    };

    try {
      const response = await fetch(publerApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.publerApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: postContent.text,
          networks: ['facebook', 'twitter'], // Adjust based on your connected accounts
          status: 'scheduled', // or 'draft' to review first
          scheduled_at: null, // Post immediately or set specific time
          link_url: postContent.link,
          link_title: 'Sandusky Current - Local News Update',
          workspace_id: this.workspaceId
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Posted to Publer:', summary.category, '-', summary.socialMedia.substring(0, 50));
        return data;
      } else {
        const error = await response.text();
        throw new Error(`Publer API error: ${response.status} - ${error}`);
      }
    } catch (error) {
      console.error('Publer posting error:', error);
      throw error;
    }
  }

  async mockPost(summary) {
    // Simulate posting for development
    const hashtags = this.getHashtags(summary.category, summary.severity);
    const fullText = `${summary.socialMedia} ${hashtags}`;
    
    console.log('📱 [MOCK] Would post to social media via Publer:');
    console.log(`   Workspace: ${this.workspaceId}`);
    console.log(`   Category: ${summary.category} | Severity: ${summary.severity}`);
    console.log(`   Text: ${fullText}`);
    console.log(`   Length: ${fullText.length} chars`);
    
    return {
      success: true,
      mock: true,
      text: fullText,
      workspace: this.workspaceId,
      timestamp: new Date().toISOString()
    };
  }

  getHashtags(category, severity) {
    const baseHashtags = '#SanduskyOhio #ErieCounty #LocalNews';
    
    const categoryHashtags = {
      'fire': '#Fire #FireDepartment',
      'crime': '#Police #PublicSafety',
      'medical': '#EMS #Medical',
      'accident': '#Traffic #Accident',
      'traffic': '#Traffic #RoadSafety'
    };
    
    const severityHashtags = {
      'critical': '#BreakingNews #Emergency',
      'high': '#Breaking #Alert'
    };
    
    let hashtags = baseHashtags;
    
    if (categoryHashtags[category]) {
      hashtags = `${categoryHashtags[category]} ${hashtags}`;
    }
    
    if (severityHashtags[severity]) {
      hashtags = `${severityHashtags[severity]} ${hashtags}`;
    }
    
    return hashtags;
  }

  shouldPost(summary) {
    // Additional filtering rules for social media
    // Only post medium severity and above
    if (summary.severity === 'low') {
      return false;
    }
    
    return true;
  }

  getPostedCount() {
    return this.postedIds.size;
  }

  getQueueLength() {
    return this.postQueue.length;
  }
}

module.exports = SocialMediaService;