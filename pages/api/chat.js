import { OpenAI } from 'openai';
import axios from 'axios';
import xml2js from 'xml2js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Cache for storing sitemap data and conversations
let sitemapCache = null;
let conversationCache = new Map();

async function fetchSitemapData() {
  if (sitemapCache) return sitemapCache;

  try {
    const response = await axios.get('https://www.whoisextractor.in/sitemap.xml');
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(response.data);
    
    // Get all relevant product and information pages
    const pages = result.urlset.url
      .map(url => url.loc[0])
      .filter(url => 
        url.includes('/whois-database') ||
        url.includes('/country-specific') ||
        url.includes('/website-details') ||
        url.includes('/newly-registered') ||
        url.includes('/old-whois-database')
      );
    
    sitemapCache = {
      allPages: pages,
      mainProducts: {
        global: pages.find(url => url.includes('/whois-database-download/')),
        countrySpecific: pages.find(url => url.includes('/country-specific-whois-database/')),
        india: pages.find(url => url.includes('/india-whois-database/')),
        us: pages.find(url => url.includes('/us-whois-database/')),
        australia: pages.find(url => url.includes('/australia-whois-database/'))
      }
    };
    return sitemapCache;
  } catch (error) {
    console.error('Error fetching sitemap:', error);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message, sessionId } = req.body;
    const sitemapData = await fetchSitemapData();

    // Get or initialize conversation history
    if (!conversationCache.has(sessionId)) {
      conversationCache.set(sessionId, [{
        role: "system",
        content: `You are an intelligent sales assistant for WHOIS database CSV files.

Knowledge Base:
- Product Offerings:
  • Global WHOIS Database ($199): Complete domain registration data
  • Country-Specific Databases:
    - India WHOIS ($99): All .in domains
    - US WHOIS ($149): All .us domains
    - Australia WHOIS ($129): All .au domains

- Key Features:
  • Monthly updated CSV files
  • Direct download access
  • Complete WHOIS records
  • Bulk data delivery
  • Clean, verified data
  • Regular updates

Behavior Rules:
1. Be concise but thorough
2. Remember context from previous messages
3. Only include URLs when specifically discussing purchases
4. Maintain professional tone
5. Show product expertise
6. Keep basic responses under 50 words
7. Understand implied questions`
      }]);
    }

    // Get conversation history
    const conversationHistory = conversationCache.get(sessionId);
    
    // Add user message
    conversationHistory.push({ role: "user", content: message });
    
    // Keep conversation history limited to last 10 messages
    const recentConversation = conversationHistory.slice(-10);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: recentConversation,
      temperature: 0.7, // Increased for more natural responses
      max_tokens: 150,  // Increased for more detailed responses
      presence_penalty: 0.6, // Encourages new information
      frequency_penalty: 0.4 // Reduces repetition
    });

    // Store assistant's response in history
    const assistantMessage = completion.choices[0].message;
    conversationHistory.push(assistantMessage);
    
    // Update cache
    conversationCache.set(sessionId, conversationHistory);

    // Clean old sessions (older than 30 minutes)
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
    for (const [sid, history] of conversationCache.entries()) {
      if (history.lastAccess < thirtyMinutesAgo) {
        conversationCache.delete(sid);
      }
    }

    res.status(200).json({ message: assistantMessage.content });
  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ message: 'Error processing your request' });
  }
}