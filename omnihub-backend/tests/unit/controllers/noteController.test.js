import { noteController } from '../../../src/controllers/noteController.js';

describe('NoteController Unit Tests', () => {
  it('should export noteController object', () => {
    expect(noteController).toBeDefined();
    expect(typeof noteController.getNotes).toBe('function');
    expect(typeof noteController.addNote).toBe('function');
  });
});
