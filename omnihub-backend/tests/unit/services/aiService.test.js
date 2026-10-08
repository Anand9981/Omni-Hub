import { aiService } from '../../../src/services/aiService.js';

describe('AIService Unit Tests', () => {
  it('should detect language correctly for English, Hindi, and Hinglish', () => {
    expect(aiService).toBeDefined();

    const langHindi = aiService.detectLanguage('नमस्ते आप कैसे हैं?');
    expect(langHindi).toBe('Hindi');

    const langHinglish = aiService.detectLanguage('bhai price kya hai?');
    expect(langHinglish).toBe('Hinglish');

    const langEnglish = aiService.detectLanguage('Hello how are you?');
    expect(langEnglish).toBe('English');
  });

  it('should polish draft responses politely', async () => {
    const polished = await aiService.polishDraft({ text: 'thanks for contacting us' });
    expect(polished).toBeDefined();
    expect(typeof polished).toBe('string');
  });
});
