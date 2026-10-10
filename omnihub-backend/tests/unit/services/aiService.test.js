import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { aiService } from '../../../src/services/aiService.js';
import { connectDB, disconnectDB } from '../../../src/config/db.js';

describe('AIService Real Unit Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('should detect language accurately across scripts', () => {
    expect(aiService.detectLanguage('नमस्ते क्या सहायता चाहिए?')).toBe('Hindi');
    expect(aiService.detectLanguage('bhai pricing kya hai demo plan ki?')).toBe('Hinglish');
    expect(aiService.detectLanguage('How much does the starter tier cost?')).toBe('English');
    expect(aiService.detectLanguage('')).toBe('English');
  });

  it('should generate intelligent contextual reply in English', async () => {
    const res = await aiService.generateReply({ userMessage: 'What are your support hours?' });
    expect(res).toHaveProperty('text');
    expect(res.language).toBe('English');
    expect(res.text.length).toBeGreaterThan(5);
  });

  it('should generate intelligent contextual reply matching Hinglish query', async () => {
    const res = await aiService.generateReply({ userMessage: 'Bhai pricing kya hai?' });
    expect(res).toHaveProperty('text');
    expect(res.language).toBe('Hinglish');
    expect(res.text.length).toBeGreaterThan(5);
  });

  it('should generate intelligent contextual reply matching Hindi query', async () => {
    const res = await aiService.generateReply({ userMessage: 'नमस्ते, क्या आप सहायता कर सकते हैं?' });
    expect(res).toHaveProperty('text');
    expect(res.language).toBe('Hindi');
    expect(res.text.length).toBeGreaterThan(5);
  });

  it('should polish rough draft text into professional response', async () => {
    const rough = 'office band hai kal aao';
    const polished = await aiService.polishDraft({ text: rough, tone: 'Professional' });
    expect(polished).toBeDefined();
    expect(polished.length).toBeGreaterThanOrEqual(rough.length);
  });
});
