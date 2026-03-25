import { useState } from 'react';
import { TrendingUp, Wallet, PlusCircle, X } from 'lucide-react';
import { MarketCard } from './components/MarketCard';
import { initialMarkets } from './data';
import type { Market, Outcome, Bet } from './types';

function App() {
  const [markets, setMarkets] = useState<Market[]>(initialMarkets);
  const [userBalance, setUserBalance] = useState(100);
  const [bets, setBets] = useState<Bet[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  // Create market form state
  const [newMarketTitle, setNewMarketTitle] = useState('');
  const [newMarketDesc, setNewMarketDesc] = useState('');
  const [newMarketCategory, setNewMarketCategory] = useState('School Life');
  const [newMarketOutcomes, setNewMarketOutcomes] = useState(['Yes', 'No']);

  const categories = ['All', 'School Life', 'Academics', 'Food', 'Weather'];

  const filteredMarkets = activeCategory === 'All'
    ? markets
    : markets.filter(m => m.category === activeCategory);

  const handleBet = (market: Market, outcome: Outcome, amount: number) => {
    if (amount > userBalance) return;

    setUserBalance(prev => prev - amount);
    
    setMarkets(prev => prev.map(m => {
      if (m.id === market.id) {
        return {
          ...m,
          outcomes: m.outcomes.map(o => 
            o.id === outcome.id 
              ? { ...o, pool: o.pool + amount }
              : o
          ),
          volume: m.volume + amount
        };
      }
      return m;
    }));

    setBets(prev => [...prev, {
      marketId: market.id,
      outcomeId: outcome.id,
      amount,
      timestamp: new Date()
    }]);
  };

  const handleCreateMarket = () => {
    if (!newMarketTitle || !newMarketDesc) return;

    const newMarket: Market = {
      id: Date.now().toString(),
      title: newMarketTitle,
      description: newMarketDesc,
      category: newMarketCategory,
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      volume: 0,
      icon: 'trending-up',
      outcomes: newMarketOutcomes.map((label, i) => ({
        id: `${Date.now()}-${i}`,
        label,
        probability: Math.floor(100 / newMarketOutcomes.length),
        pool: 0
      }))
    };

    setMarkets(prev => [newMarket, ...prev]);
    setShowCreateModal(false);
    setNewMarketTitle('');
    setNewMarketDesc('');
    setNewMarketOutcomes(['Yes', 'No']);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">APU Polymarket</h1>
                <p className="text-xs text-gray-500">School Prediction Markets</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-lg">
                <Wallet className="w-5 h-5 text-indigo-600" />
                <span className="font-bold text-indigo-900">${userBalance}</span>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                <PlusCircle className="w-5 h-5" />
                Create Market
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Markets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMarkets.map(market => (
            <MarketCard
              key={market.id}
              market={market}
              onBet={handleBet}
              userBalance={userBalance}
            />
          ))}
        </div>

        {filteredMarkets.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No markets found in this category.</p>
          </div>
        )}

        {/* My Bets Section */}
        {bets.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">My Bets</h2>
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {bets.slice().reverse().map((bet, i) => {
                  const market = markets.find(m => m.id === bet.marketId);
                  const outcome = market?.outcomes.find(o => o.id === bet.outcomeId);
                  return (
                    <div key={i} className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{market?.title}</p>
                        <p className="text-sm text-gray-500">
                          Bet on: {outcome?.label} • {bet.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                      <span className="font-bold text-indigo-600">-${bet.amount}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Create Market Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create New Market</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Market Title
                </label>
                <input
                  type="text"
                  value={newMarketTitle}
                  onChange={(e) => setNewMarketTitle(e.target.value)}
                  placeholder="e.g., Will it rain tomorrow?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newMarketDesc}
                  onChange={(e) => setNewMarketDesc(e.target.value)}
                  placeholder="Describe what people are predicting..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newMarketCategory}
                  onChange={(e) => setNewMarketCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outcomes (comma separated)
                </label>
                <input
                  type="text"
                  value={newMarketOutcomes.join(', ')}
                  onChange={(e) => setNewMarketOutcomes(e.target.value.split(',').map(s => s.trim()))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <button
                onClick={handleCreateMarket}
                disabled={!newMarketTitle || !newMarketDesc}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Create Market
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
