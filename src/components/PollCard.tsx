import { useState } from 'react';
import type { Poll } from '../types';
import { BarChart3, PieChart, Users, Check } from 'lucide-react';

interface PollCardProps {
  poll: Poll;
  onVote: (pollId: string, optionId: string) => void;
  hasVoted: boolean;
  userVoteOptionId?: string;
}

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  indigo: 'bg-indigo-500',
  orange: 'bg-orange-500',
};

export function PollCard({ poll, onVote, hasVoted, userVoteOptionId }: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(hasVoted);

  const handleVote = () => {
    if (selectedOption && !hasVoted) {
      onVote(poll.id, selectedOption);
      setShowResults(true);
    }
  };


  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
            {poll.totalVotes > 0 ? (
              <PieChart className="w-6 h-6 text-purple-600" />
            ) : (
              <BarChart3 className="w-6 h-6 text-purple-600" />
            )}
          </div>
          <div className="flex-1">
            <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">
              {poll.category}
            </span>
            <h3 className="text-lg font-bold text-gray-900 mt-1">{poll.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{poll.description}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {poll.totalVotes} votes
          </span>
          <span>Created: {new Date(poll.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="mt-4 space-y-3">
          {showResults || hasVoted ? (
            // Results view
            poll.options.map((option) => {
              const percentage = poll.totalVotes > 0 
                ? Math.round((option.votes / poll.totalVotes) * 100) 
                : 0;
              const isUserChoice = userVoteOptionId === option.id;
              
              return (
                <div key={option.id} className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-900 flex items-center gap-2">
                      {option.label}
                      {isUserChoice && (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" />
                          You
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-bold text-gray-700">{percentage}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colorClasses[option.color] || 'bg-gray-500'} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {option.votes} votes
                  </div>
                </div>
              );
            })
          ) : (
            // Voting view
            poll.options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  selectedOption === option.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedOption === option.id
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedOption === option.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="font-medium text-gray-900">{option.label}</span>
                </div>
              </button>
            ))
          )}
        </div>

        {!showResults && !hasVoted && (
          <button
            onClick={handleVote}
            disabled={!selectedOption}
            className="w-full mt-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Vote
          </button>
        )}

        {!hasVoted && showResults && (
          <button
            onClick={() => setShowResults(false)}
            className="w-full mt-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Back to Voting
          </button>
        )}

        {(hasVoted || showResults) && (
          <p className="mt-3 text-xs text-center text-gray-500">
            Thanks for voting! 🎉
          </p>
        )}
      </div>
    </div>
  );
}
