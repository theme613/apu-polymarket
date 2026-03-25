export interface Outcome {
  id: string;
  label: string;
  probability: number;
  pool: number;
  votes?: number;
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

export interface Poll {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
  totalVotes: number;
  options: PollOption[];
  icon: string;
  allowMultiple?: boolean;
}

export interface PollOption {
  id: string;
  label: string;
  votes: number;
  color: string;
}

export interface Bet {
  marketId: string;
  outcomeId: string;
  amount: number;
  timestamp: Date;
}

export interface Vote {
  pollId: string;
  optionId: string;
  timestamp: Date;
}
