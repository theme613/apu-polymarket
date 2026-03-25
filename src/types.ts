export interface Outcome {
  id: string;
  label: string;
  probability: number;
  pool: number;
}

export interface Market {
  id: string;
  title: string;
  description: string;
  category: string;
  endDate: string;
  volume: number;
  outcomes: Outcome[];
  icon: string;
}

export interface Bet {
  marketId: string;
  outcomeId: string;
  amount: number;
  timestamp: Date;
}
