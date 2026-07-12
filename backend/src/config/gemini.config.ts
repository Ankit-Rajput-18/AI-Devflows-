import { registerAs } from '@nestjs/config';

export default registerAs('gemini', () => ({
  apiKey: process.env.GEMINI_API_KEY,
  model: 'gemini-1.5-flash',
  maxTokens: 8192,
  temperature: 0.7,
}));
