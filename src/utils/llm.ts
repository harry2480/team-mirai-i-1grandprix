import * as dotenv from 'dotenv';
import * as path from 'path';

// .env.localを明示的に読み込み
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const OPENROUTER_API_KEY = process.env.AI_GATEWAY_API_KEY || '';

export interface GenerateOptions {
  model?: string;
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  systemInstruction?: string;
}

/**
 * OpenRouter経由でGemini APIを呼び出してテキスト生成
 */
export async function generateText(
  prompt: string,
  options: GenerateOptions = {}
): Promise<string> {
  const {
    model = process.env.DEFAULT_MODEL || 'google/gemini-2.0-flash-exp',
    maxOutputTokens = parseInt(process.env.MAX_OUTPUT_TOKENS || '64000'),
    temperature = 0.7,
    topP = 0.95,
  } = options;

  console.log(`   🌐 Calling OpenRouter API...`);
  console.log(`      Model: ${model}`);
  console.log(`      Max tokens: ${maxOutputTokens}`);
  console.log(`      Prompt length: ${prompt.length} chars\n`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 2分タイムアウト

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/team-mirai-i-1-grand-prix',
        'X-Title': 'Bill of Lading Analysis',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional policy analyst specializing in detailed, comprehensive reports. You MUST produce reports of at least 10,000 characters with extensive quotations from source data. Never produce short summaries or incomplete analysis. Follow all formatting and length requirements precisely.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: maxOutputTokens,
        temperature,
        top_p: topP,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`\n❌ API Error Response (${response.status}):`);
      console.error(errorText);
      throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
    }

    const data: any = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('\n❌ Invalid API Response:');
      console.error(JSON.stringify(data, null, 2));
      throw new Error('Invalid response structure from OpenRouter API');
    }

    console.log(`   ✅ API call successful`);
    console.log(`      Response length: ${data.choices[0].message.content.length} chars\n`);

    return data.choices[0].message.content;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('API request timeout after 2 minutes');
    }
    throw error;
  }
}

/**
 * JSON形式のレスポンスを期待する場合
 */
export async function generateJSON<T>(
  prompt: string,
  options: GenerateOptions = {}
): Promise<T> {
  const text = await generateText(prompt, options);
  
  // コードブロックを除去
  const jsonText = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  try {
    return JSON.parse(jsonText) as T;
  } catch (error) {
    console.error('JSON parse error:', error);
    console.error('Response text:', text);
    throw new Error('Failed to parse JSON response from LLM');
  }
}
