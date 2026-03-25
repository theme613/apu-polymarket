import { useState, useEffect } from 'react';
import { TrendingUp, Wallet, PlusCircle, X, BarChart3, Trash2, RotateCcw } from 'lucide-react';
import { MarketCard } from './components/MarketCard';
import { PollCard } from './components/PollCard';
import { initialMarkets, initialPolls } from './data';
import type { Market, Poll, Outcome, Bet, Vote } from './types';

const STORAGE_KEYS = {
  markets: 'apu-polymarket-markets',
  polls: 'apu-polymarket-polls',
  balance: 'apu-polymarket-balance',
  bets: 'apu-polymarket-bets',
  votes: 'apu-polymarket-votes',
};

function App() {
  // Load from localStorage or use defaults
  const [markets, setMarkets] = useState<Market[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.markets);
    return saved ? JSON.parse(saved) : initialMarkets;
  });
  
  const [polls, setPolls] = useState<Poll[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.polls);
    return saved ? JSON.parse(saved) : initialPolls;
  });
  
  const [userBalance, setUserBalance] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.balance);
    return saved ? Number(saved) : 100;
  });
  
  const [bets, setBets] = useState<Bet[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.bets);
    return saved ? JSON.parse(saved, (key, value) => {
      if (key === 'timestamp') return new Date(value);
      return value;
    }) : [];
  });
  
  const [votes, setVotes] = useState<Vote[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.votes);
    return saved ? JSON.parse(saved, (key, value) => {
      if (key === 'timestamp') return new Date(value);
      return value;
    }) : [];
  });

  const [activeTab, setActiveTab] = useState<'markets' | 'polls'>('markets');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'market' | 'poll'>('market');
  const [activeCategory, setActiveCategory] = useState('All');

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('School Life');
  const [newOutcomes, setNewOutcomes] = useState(['Yes', 'No']);
  const [newPollOptions, setNewPollOptions] = useState(['Option 1', 'Option 2']);

  const categories = ['All', 'School Life', 'Academics', 'Food', 'Weather'];

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.markets, JSON.stringify(markets));
  }, [markets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.polls, JSON.stringify(polls));
  }, [polls]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.balance, String(userBalance));
  }, [userBalance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.bets, JSON.stringify(bets));
  }, [bets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.votes, JSON.stringify(votes));
  }, [votes]);

  const filteredMarkets = activeCategory === 'All'
    ? markets
    : markets.filter(m => m.category === activeCategory);

  const filteredPolls = activeCategory === 'All'
    ? polls
    : polls.filter(p => p.category === activeCategory);

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

  const handleVote = (pollId: string, optionId: string) => {
    // Check if already voted
    if (votes.some(v => v.pollId === pollId)) return;

    setPolls(prev => prev.map(p => {
      if (p.id === pollId) {
        return {
          ...p,
          totalVotes: p.totalVotes + 1,
          options: p.options.map(o =>
            o.id === optionId
              ? { ...o, votes: o.votes + 1 }
              : o
          )
        };
      }
      return p;
    }));

    setVotes(prev => [...prev, {
      pollId,
      optionId,
      timestamp: new Date()
    }]);
  };

  const handleCreate = () => {
    if (!newTitle || !newDesc) return;

    if (createType === 'market') {
      const newMarket: Market = {
        id: Date.now().toString(),
        title: newTitle,
        description: newDesc,
        category: newCategory,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        volume: 0,
        icon: 'trending-up',
        outcomes: newOutcomes.map((label, i) => ({
          id: `${Date.now()}-${i}`,
          label,
          probability: Math.floor(100 / newOutcomes.length),
          pool: 0
        }))
      };
      setMarkets(prev => [newMarket, ...prev]);
    } else {
      const colors = ['blue', 'green', 'red', 'yellow', 'purple', 'pink'];
      const newPoll: Poll = {
        id: `p${Date.now()}`,
        title: newTitle,
        description: newDesc,
        category: newCategory,
        createdAt: new Date().toISOString().split('T')[0],
        totalVotes: 0,
        icon: 'bar-chart',
        options: newPollOptions.map((label, i) => ({
          id: `p${Date.now()}-${i}`,
          label,
          votes: 0,
          color: colors[i % colors.length]
        }))
      };
      setPolls(prev => [newPoll, ...prev]);
    }

    resetForm();
    setShowCreateModal(false);
  };

  const resetForm = () => {
    setNewTitle('');
    setNewDesc('');
    setNewOutcomes(['Yes', 'No']);
    setNewPollOptions(['Option 1', 'Option 2']);
  };

  const resetAllData = () => {
    if (confirm('Are you sure? This will reset ALL data to defaults!')) {
      localStorage.clear();
      setMarkets(initialMarkets);
      setPolls(initialPolls);
      setUserBalance(100);
      setBets([]);
      setVotes([]);
    }
  };

  const deleteMarket = (id: string) => {
    if (confirm('Delete this market?')) {
      setMarkets(prev => prev.filter(m => m.id !== id));
    }
  };

  const deletePoll = (id: string) => {
    if (confirm('Delete this poll?')) {
      setPolls(prev => prev.filter(p => p.id !== id));
      setVotes(prev => prev.filter(v => v.pollId !== id));
    }
  };

  const hasVotedOnPoll = (pollId: string) => votes.some(v => v.pollId === pollId);
  const getUserVoteOption = (pollId: string) => votes.find(v => v.pollId === pollId)?.optionId;

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
                <p className="text-xs text-gray-500">School Prediction Markets & Polls</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-lg">
                <Wallet className="w-5 h-5 text-indigo-600" />
                <span className="font-bold text-indigo-900">${userBalance}</span>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                <PlusCircle className="w-5 h-5" />
                Create
              </button>
              <button
                onClick={resetAllData}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Reset all data"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('markets')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'markets'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Prediction Markets
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {markets.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('polls')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'polls'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Polls
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {polls.length}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

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
                  ? activeTab === 'markets'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Markets Tab */}
        {activeTab === 'markets' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMarkets.map(market => (
                <div key={market.id} className="relative group">
                  <MarketCard
                    market={market}
                    onBet={handleBet}
                    userBalance={userBalance}
                  />
                  <button
                    onClick={() => deleteMarket(market.id)}
                    className="absolute top-2 right-2 p-2 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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
                              Bet on: {outcome?.label} • {new Date(bet.timestamp).toLocaleDateString()}
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
          </>
        )}

        {/* Polls Tab */}
        {activeTab === 'polls' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPolls.map(poll => (
                <div key={poll.id} className="relative group">
                  <PollCard
                    poll={poll}
                    onVote={handleVote}
                    hasVoted={hasVotedOnPoll(poll.id)}
                    userVoteOptionId={getUserVoteOption(poll.id)}
                  />
                  <button
                    onClick={() => deletePoll(poll.id)}
                    className="absolute top-2 right-2 p-2 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {filteredPolls.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No polls found in this category.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create New</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Type Selection */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setCreateType('market')}
                className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
                  createType === 'market'
                    ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-500'
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                }`}
              >
                Prediction Market
              </button>
              <button
                onClick={() => setCreateType('poll')}
                className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
                  createType === 'poll'
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                }`}
              >
                Poll
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={createType === 'market' ? "e.g., Will it rain tomorrow?" : "e.g., Best lunch spot?"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe what people are predicting or voting on..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {createType === 'market' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Outcomes (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newOutcomes.join(', ')}
                    onChange={(e) => setNewOutcomes(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="Yes, No, Maybe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Options (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newPollOptions.join(', ')}
                    onChange={(e) => setNewPollOptions(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="Option 1, Option 2, Option 3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}

              <button
                onClick={handleCreate}
                disabled={!newTitle || !newDesc || (createType === 'market' ? newOutcomes.length < 2 : newPollOptions.length < 2)}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  createType === 'market'
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white disabled:bg-gray-400 disabled:cursor-not-allowed`}
              >
                Create {createType === 'market' ? 'Market' : 'Poll'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
