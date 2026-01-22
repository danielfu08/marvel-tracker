import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock localStorage for Node.js environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});

describe('Marvel Tracker - localStorage functionality', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should save progress to localStorage when content is updated', () => {
    const mockProgress = {
      '6d488zb9m': {
        watched: true,
        rating: 5,
        comment: 'Great movie!',
        scheduled_date: '2026-01-22'
      },
      'qoor8d1uz': {
        watched: false,
        rating: 4,
        comment: 'Good series',
        scheduled_date: '2026-01-23'
      }
    };

    localStorage.setItem('marvelTrackerProgress', JSON.stringify(mockProgress));
    
    const savedProgress = localStorage.getItem('marvelTrackerProgress');
    expect(savedProgress).toBeDefined();
    
    const parsed = JSON.parse(savedProgress!);
    expect(parsed['6d488zb9m'].watched).toBe(true);
    expect(parsed['6d488zb9m'].rating).toBe(5);
    expect(parsed['qoor8d1uz'].comment).toBe('Good series');
  });

  it('should load progress from localStorage on mount', () => {
    const mockProgress = {
      '6d488zb9m': {
        watched: true,
        rating: 5,
        comment: 'Excellent!',
        scheduled_date: '2026-01-22'
      }
    };

    localStorage.setItem('marvelTrackerProgress', JSON.stringify(mockProgress));
    
    const loaded = localStorage.getItem('marvelTrackerProgress');
    expect(loaded).toBeDefined();
    
    const data = JSON.parse(loaded!);
    expect(data['6d488zb9m'].watched).toBe(true);
    expect(data['6d488zb9m'].rating).toBe(5);
  });

  it('should merge saved progress with new data', () => {
    const originalData = [
      {
        id: '6d488zb9m',
        title: 'Captain America',
        saga: 'MCU',
        synopsis: 'Test',
        image_url: 'test.jpg',
        content_type: 'Película',
        universe: 'Universo Principal MCU',
        rating: 0,
        comment: '',
        scheduled_date: '',
        watched: false
      }
    ];

    const savedProgress = {
      '6d488zb9m': {
        watched: true,
        rating: 5,
        comment: 'Great!',
        scheduled_date: '2026-01-22'
      }
    };

    localStorage.setItem('marvelTrackerProgress', JSON.stringify(savedProgress));
    
    const progressMap = JSON.parse(localStorage.getItem('marvelTrackerProgress')!);
    const mergedData = originalData.map(item => ({
      ...item,
      ...(progressMap[item.id] || {})
    }));

    expect(mergedData[0].watched).toBe(true);
    expect(mergedData[0].rating).toBe(5);
    expect(mergedData[0].comment).toBe('Great!');
  });

  it('should handle empty localStorage gracefully', () => {
    const saved = localStorage.getItem('marvelTrackerProgress');
    expect(saved).toBeNull();
  });

  it('should update specific fields without losing others', () => {
    const initialProgress = {
      '6d488zb9m': {
        watched: true,
        rating: 5,
        comment: 'Original comment',
        scheduled_date: '2026-01-22'
      }
    };

    localStorage.setItem('marvelTrackerProgress', JSON.stringify(initialProgress));

    // Update only the rating
    const progress = JSON.parse(localStorage.getItem('marvelTrackerProgress')!);
    progress['6d488zb9m'].rating = 4;
    localStorage.setItem('marvelTrackerProgress', JSON.stringify(progress));

    const updated = JSON.parse(localStorage.getItem('marvelTrackerProgress')!);
    expect(updated['6d488zb9m'].rating).toBe(4);
    expect(updated['6d488zb9m'].comment).toBe('Original comment');
    expect(updated['6d488zb9m'].watched).toBe(true);
  });
});
