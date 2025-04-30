
export interface FallingItemType {
  id: string;
  type: 'biscuit' | 'egg';
  x: number;
  y: number;
  speed: number;
}

export interface ScoreAnimationType {
  id: string;
  x: number;
  y: number;
  opacity: number;
}
