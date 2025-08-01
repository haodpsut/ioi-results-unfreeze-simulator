export interface ScoreUpdate {
  problem: string;
  pointsGained: number;
  revealTime: number; // Used for sorting the reveal queue
}

export interface TeamStanding {
  id: string; 
  initialRank: number;
  teamName: string;
  scorePreFreeze: number;
  frozenUpdates: ScoreUpdate[];
  scoreTotal: number;
  revealedUpdatesCount: number;
}

export interface RevealEvent {
  teamId: string;
  teamName: string;
  update: ScoreUpdate;
}

export enum AppPhase {
  SETUP = 'SETUP',
  REVEALING = 'REVEALING',
  FINISHED = 'FINISHED',
}
