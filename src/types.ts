export type Priority = 'high' | 'medium' | 'low';

export type Category = 'work' | 'health' | 'relax' | 'quick_win';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  createdAt: number;
}

export type TabType = 'dashboard' | 'games' | 'sounds_dump';

export type MiniGameType = 'bubble' | 'memory' | 'kinetic';

export interface SoundTrack {
  id: string;
  name: string;
  type: 'rain' | 'wind' | 'brown' | 'ocean';
  active: boolean;
  volume: number;
}

export interface Quote {
  text: string;
  author: string;
}
