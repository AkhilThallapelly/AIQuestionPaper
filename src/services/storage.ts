import { PaperGenerationResponse } from '../types/api';

export interface SavedPaper {
  id: string;
  title: string;
  metadata: {
    board: string;
    class_level: string;
    subject: string;
    chapters: string[];
    difficulty: string;
    marks: number;
    generated_at: string;
  };
  sections: any[];
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = 'question_papers';
const ANSWER_KEY_STORAGE_KEY = 'answer_keys';

export class PaperStorageService {
  /**
   * Save a paper to localStorage
   */
  static savePaper(paper: PaperGenerationResponse): void {
    try {
      const savedPapers = this.getAllPapers();
      
      const savedPaper: SavedPaper = {
        id: paper.paper_id,
        title: this.generatePaperTitle(paper.metadata),
        metadata: paper.metadata,
        sections: paper.sections,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Check if paper already exists (update) or add new
      const existingIndex = savedPapers.findIndex(p => p.id === paper.paper_id);
      if (existingIndex >= 0) {
        savedPapers[existingIndex] = savedPaper;
      } else {
        savedPapers.push(savedPaper);
      }

      // Sort by creation date (newest first)
      savedPapers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPapers));
      console.log('Paper saved to localStorage:', savedPaper.title);
    } catch (error) {
      console.error('Error saving paper to localStorage:', error);
    }
  }

  /**
   * Get all saved papers
   */
  static getAllPapers(): SavedPaper[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving papers from localStorage:', error);
      return [];
    }
  }

  /**
   * Get a specific paper by ID
   */
  static getPaperById(id: string): SavedPaper | null {
    try {
      const papers = this.getAllPapers();
      return papers.find(paper => paper.id === id) || null;
    } catch (error) {
      console.error('Error retrieving paper from localStorage:', error);
      return null;
    }
  }

  /**
   * Delete a paper by ID
   */
  static deletePaper(id: string): boolean {
    try {
      const papers = this.getAllPapers();
      const filteredPapers = papers.filter(paper => paper.id !== id);
      
      if (filteredPapers.length < papers.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPapers));
        console.log('Paper deleted from localStorage:', id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting paper from localStorage:', error);
      return false;
    }
  }

  /**
   * Clear all saved papers
   */
  static clearAllPapers(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('All papers cleared from localStorage');
    } catch (error) {
      console.error('Error clearing papers from localStorage:', error);
    }
  }

  /**
   * Get storage usage information
   */
  static getStorageInfo(): { count: number; size: string } {
    try {
      const papers = this.getAllPapers();
      const data = localStorage.getItem(STORAGE_KEY) || '';
      const sizeInBytes = new Blob([data]).size;
      const sizeInKB = (sizeInBytes / 1024).toFixed(2);
      
      return {
        count: papers.length,
        size: `${sizeInKB} KB`
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { count: 0, size: '0 KB' };
    }
  }

  /**
   * Generate a descriptive title for the paper
   */
  private static generatePaperTitle(metadata: any): string {
    const { board, class_level, subject, chapters, marks, difficulty } = metadata;
    const chapterText = chapters.length > 3 
      ? `${chapters.slice(0, 3).join(', ')} +${chapters.length - 3} more`
      : chapters.join(', ');
    
    return `${board} Class ${class_level} ${subject} - ${marks} marks (${difficulty})`;
  }

  /**
   * Export papers as JSON
   */
  static exportPapers(): string {
    try {
      const papers = this.getAllPapers();
      return JSON.stringify(papers, null, 2);
    } catch (error) {
      console.error('Error exporting papers:', error);
      return '[]';
    }
  }

  /**
   * Import papers from JSON
   */
  static importPapers(jsonData: string): boolean {
    try {
      const importedPapers = JSON.parse(jsonData);
      if (Array.isArray(importedPapers)) {
        const existingPapers = this.getAllPapers();
        const mergedPapers = [...existingPapers, ...importedPapers];
        
        // Remove duplicates based on ID
        const uniquePapers = mergedPapers.filter((paper, index, self) => 
          index === self.findIndex(p => p.id === paper.id)
        );
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(uniquePapers));
        console.log('Papers imported successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing papers:', error);
      return false;
    }
  }

  /**
   * Save answer key for a paper
   */
  static saveAnswerKey(paperId: string, answerKey: any): void {
    try {
      const answerKeys = this.getAnswerKeys();
      
      const answerKeyData = {
        paperId,
        answerKey,
        created_at: new Date().toISOString(),
      };

      // Check if answer key already exists (update) or add new
      const existingIndex = answerKeys.findIndex(ak => ak.paperId === paperId);
      if (existingIndex >= 0) {
        answerKeys[existingIndex] = answerKeyData;
      } else {
        answerKeys.push(answerKeyData);
      }

      localStorage.setItem(ANSWER_KEY_STORAGE_KEY, JSON.stringify(answerKeys));
      console.log('Answer key saved to localStorage for paper:', paperId);
    } catch (error) {
      console.error('Error saving answer key to localStorage:', error);
    }
  }

  /**
   * Get answer key for a paper
   */
  static getAnswerKey(paperId: string): any | null {
    try {
      const answerKeys = this.getAnswerKeys();
      const answerKeyData = answerKeys.find(ak => ak.paperId === paperId);
      return answerKeyData ? answerKeyData.answerKey : null;
    } catch (error) {
      console.error('Error retrieving answer key from localStorage:', error);
      return null;
    }
  }

  /**
   * Delete answer key for a paper
   */
  static deleteAnswerKey(paperId: string): boolean {
    try {
      const answerKeys = this.getAnswerKeys();
      const filteredKeys = answerKeys.filter(ak => ak.paperId !== paperId);
      
      if (filteredKeys.length < answerKeys.length) {
        localStorage.setItem(ANSWER_KEY_STORAGE_KEY, JSON.stringify(filteredKeys));
        console.log('Answer key deleted from localStorage for paper:', paperId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting answer key from localStorage:', error);
      return false;
    }
  }

  /**
   * Get all answer keys
   */
  private static getAnswerKeys(): any[] {
    try {
      const stored = localStorage.getItem(ANSWER_KEY_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving answer keys from localStorage:', error);
      return [];
    }
  }
}

export default PaperStorageService;
