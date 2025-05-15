import { OpenAI } from 'openai';
import axios from 'axios';
import xml2js from 'xml2js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Cache for storing sitemap data
let sitemapCache = null;

async function fetchSitemapData() {
  if (sitemapCache) return sitemapCache;

  try {
    const response = await axios.get('https://www.whoisextractor.in/sitemap.xml');
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(response.data);
    
    // Process sitemap URLs to find relevant pages
    const urls = {
      whoisDatabase: result.urlset.url
        .map(url => url.loc[0])
        .find(url => url.includes('/whois-database-download/')),
      countrySpecific: result.urlset.url
        .map(url => url.loc[0])
        .find(url => url.includes('/country-specific-whois-database/')),
      indiaWhois: result.urlset.url
        .map(url => url.loc[0])
        .find(url => url.includes('/country-specific/india-whois-database/')),
      usWhois: result.urlset.url
        .map(url => url.loc[0])
        .find(url => url.includes('/country-specific/us-whois-database/'))
    };
    
    sitemapCache = urls;
    return urls;
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
    const { message } = req.body;
    const urls = await fetchSitemapData();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a sales assistant for WHOIS database CSV files. Important rules:
- Main WHOIS Database: ${urls.whoisDatabase}
- Country Specific Options: ${urls.countrySpecific}
- India WHOIS Database ($99): ${urls.indiaWhois}
- US WHOIS Database ($149): ${urls.usWhois}
- Always provide direct product page URL in responses
- All data is in CSV format
- Monthly database updates
- Keep responses under 20 words and always include relevant product URL`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.3,
      max_tokens: 75
    });

    res.status(200).json({ message: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ message: 'Error processing your request' });
  }
}