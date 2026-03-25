import { useState } from 'react';
import type { Market, Outcome } from '../types';
import { Smartphone, User, Clock, Utensils, CloudRain, Car, TrendingUp } from 'lucide-react';

interface MarketCardProps {
  market: Market;
  onBet: (market: Market, outcome: Outcome, amount: number) => void;
  userBalance: number;
}

const iconMap: Record<string, React.ElementType> = {
  smartphone: Smartphone,
  user: User,
  clock: Clock,
  utensils: Utensils,
  'cloud-rain': CloudRain,
  car: Car,
};

export function MarketCard({ market, onBet, userBalance }: MarketCardProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState(10);
  const [showBetForm, setShowBetForm] = useState(false);

  const Icon = iconMap[market.icon] || TrendingUp;

  const handleBetClick = (outcomeId: string) => {
    setSelectedOutcome(outcomeId);
    setShowBetForm(true);
  };

  const handleSubmitBet = () => {
    if (selectedOutcome && betAmount > 0 && betAmount <= userBalance) {
      const outcome = market.outcomes.find(o => o.id === selectedOutcome)!;
      onBet(market, outcome, betAmount);
      setShowBetForm(false);
      setBetAmount(10);
      setSelectedOutcome(null);
    }
  };

  const totalPool = market.outcomes.reduce((sum, o) => sum + o.pool, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <Icon className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
              {market.category}
            </span>
            <h3 className="text-lg font-bold text-gray-900 mt-1">{market.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{market.description}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          <span>Ends: {new Date(market.endDate).toLocaleDateString()}</span>
          <span>Volume: ${market.volume.toLocaleString()}</span>
        </div>

        <div className="mt-4 space-y-2">
          {market.outcomes.map((outcome) => {
            const percentage = totalPool > 0 ? (outcome.pool / totalPool) * 100 : 0;
            const isSelected = selectedOutcome === outcome.id;
            
            return (
              <div
                key={outcome.id}
                onClick={() => handleBetClick(outcome.id)}
                className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{outcome.label}</span>
                  <span className="text-sm font-bold text-indigo-600">{outcome.probability}%</span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Pool: ${outcome.pool.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>

        {showBetForm && selectedOutcome && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bet Amount (${userBalance} available)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={userBalance}
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={handleSubmitBet}
                disabled={betAmount <= 0 || betAmount > userBalance}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Place Bet
              </button>
              <button
                onClick={() => setShowBetForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
