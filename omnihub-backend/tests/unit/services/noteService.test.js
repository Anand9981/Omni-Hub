import { noteService } from '../../../src/services/noteService.js';

describe('NoteService Unit Tests', () => {
  it('should export noteService object', () => {
    expect(noteService).toBeDefined();
    expect(typeof noteService.addNote).toBe('function');
  });
});
