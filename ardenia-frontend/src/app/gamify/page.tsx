'use client';

import React, { useState } from 'react';
import {
  Trophy,
  Target,
  Zap,
  Users,
  Gift,
  TrendingUp,
  Star,
  Award,
  CheckCircle,
} from 'lucide-react';

const GamificationStrategies = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedStrategy, setExpandedStrategy] = useState(null);

  const strategies = [
    {
      id: 1,
      category: 'progression',
      icon: TrendingUp,
      title: 'Points & Scoring Systems',
      description:
        'Award points for completing actions to create a sense of achievement',
      examples: [
        'Duolingo XP',
        'Fitbit activity points',
        'Stack Overflow reputation',
      ],
      implementation: [
        'Define point values for each action',
        'Show running totals prominently',
        'Create point milestones',
        'Allow points to unlock features',
      ],
      color: 'bg-blue-500',
    },
    {
      id: 2,
      category: 'progression',
      icon: Trophy,
      title: 'Levels & Progression',
      description: 'Create a sense of advancement through tiered levels',
      examples: [
        'LinkedIn profile strength',
        'Headspace meditation levels',
        'Nike Run Club levels',
      ],
      implementation: [
        'Design 5-10 meaningful levels',
        'Show clear progress bars',
        'Unlock new features per level',
        'Celebrate level-ups with animations',
      ],
      color: 'bg-purple-500',
    },
    {
      id: 3,
      category: 'achievement',
      icon: Award,
      title: 'Badges & Achievements',
      description: 'Reward specific accomplishments with collectible badges',
      examples: [
        'Strava challenges',
        'Foursquare mayorships',
        'GitHub contribution badges',
      ],
      implementation: [
        'Create rare and common badges',
        'Make badges shareable',
        'Add hidden/secret badges',
        'Display badge collections prominently',
      ],
      color: 'bg-yellow-500',
    },
    {
      id: 4,
      category: 'motivation',
      icon: Zap,
      title: 'Streaks & Consistency',
      description: 'Encourage daily engagement through streak tracking',
      examples: [
        'Snapchat streaks',
        'Duolingo streak freeze',
        'Apple Watch activity rings',
      ],
      implementation: [
        'Show current streak prominently',
        'Send streak reminder notifications',
        'Offer streak recovery options',
        'Celebrate milestone streaks',
      ],
      color: 'bg-orange-500',
    },
    {
      id: 5,
      category: 'social',
      icon: Users,
      title: 'Leaderboards & Competition',
      description: 'Foster friendly competition through rankings',
      examples: [
        'Strava segment leaderboards',
        'Habitica party challenges',
        'Words With Friends rankings',
      ],
      implementation: [
        'Offer multiple leaderboard types (friends, global, weekly)',
        'Allow opt-out for privacy',
        'Show personalized rankings (+/- 5 positions)',
        'Reset regularly to keep fair',
      ],
      color: 'bg-green-500',
    },
    {
      id: 6,
      category: 'social',
      icon: Users,
      title: 'Social Features & Sharing',
      description:
        'Enable users to share achievements and compete with friends',
      examples: [
        'Peloton high-fives',
        'Spotify friend activity',
        'Strava kudos',
      ],
      implementation: [
        'Easy one-tap sharing',
        'Friend activity feeds',
        'Social reactions (likes, comments)',
        'Team/group challenges',
      ],
      color: 'bg-pink-500',
    },
    {
      id: 7,
      category: 'reward',
      icon: Gift,
      title: 'Rewards & Incentives',
      description: 'Provide tangible or virtual rewards for engagement',
      examples: [
        'Sweatcoin cryptocurrency',
        'MyFitnessPal premium trials',
        'Shopkick gift cards',
      ],
      implementation: [
        'Mix virtual and real rewards',
        'Create reward redemption system',
        'Offer surprise bonuses',
        'Tiered reward structures',
      ],
      color: 'bg-red-500',
    },
    {
      id: 8,
      category: 'achievement',
      icon: Target,
      title: 'Challenges & Quests',
      description: 'Create time-bound goals and missions',
      examples: [
        'Apple Watch monthly challenges',
        'Nike Training Club programs',
        'Habitica quests',
      ],
      implementation: [
        'Daily, weekly, and monthly challenges',
        'Progressive difficulty levels',
        'Clear challenge objectives',
        'Special limited-time events',
      ],
      color: 'bg-indigo-500',
    },
    {
      id: 9,
      category: 'motivation',
      icon: Star,
      title: 'Personalization & Choice',
      description:
        'Let users customize their experience and set personal goals',
      examples: [
        'Habitica avatar customization',
        'Todoist karma themes',
        'Fitness app goal setting',
      ],
      implementation: [
        'Customizable avatars/profiles',
        'Personal goal setting',
        'Theme/appearance options',
        'Choose your own adventure paths',
      ],
      color: 'bg-teal-500',
    },
    {
      id: 10,
      category: 'progression',
      icon: CheckCircle,
      title: 'Onboarding Progress',
      description: 'Guide new users with gamified tutorial experiences',
      examples: [
        'LinkedIn profile completion',
        'Trello board setup wizard',
        'Twitter profile setup',
      ],
      implementation: [
        'Progress indicators (e.g., "80% complete")',
        'Reward early actions generously',
        'Break into small steps',
        'Celebrate completion',
      ],
      color: 'bg-cyan-500',
    },
  ];

  const categories = [
    { id: 'all', label: 'All Strategies', count: strategies.length },
    {
      id: 'progression',
      label: 'Progression',
      count: strategies.filter((s) => s.category === 'progression').length,
    },
    {
      id: 'achievement',
      label: 'Achievement',
      count: strategies.filter((s) => s.category === 'achievement').length,
    },
    {
      id: 'motivation',
      label: 'Motivation',
      count: strategies.filter((s) => s.category === 'motivation').length,
    },
    {
      id: 'social',
      label: 'Social',
      count: strategies.filter((s) => s.category === 'social').length,
    },
    {
      id: 'reward',
      label: 'Rewards',
      count: strategies.filter((s) => s.category === 'reward').length,
    },
  ];

  const filteredStrategies =
    selectedCategory === 'all'
      ? strategies
      : strategies.filter((s) => s.category === selectedCategory);

  const bestPractices = [
    'Start simple - implement 2-3 mechanics first, then expand',
    'Make progress visible and meaningful',
    'Balance extrinsic rewards with intrinsic motivation',
    'Test with real users and iterate based on engagement data',
    'Avoid pay-to-win mechanics that frustrate users',
    'Ensure gamification enhances, not distracts from core value',
    'Respect user privacy and allow opt-out options',
    'Keep the difficulty curve gradual and achievable',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              App Gamification Strategies
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Proven techniques to boost engagement, retention, and user
            motivation in your app
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
              }`}
            >
              {cat.label}{' '}
              <span className="text-sm opacity-75">({cat.count})</span>
            </button>
          ))}
        </div>

        {/* Strategies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {filteredStrategies.map((strategy) => {
            const Icon = strategy.icon;
            const isExpanded = expandedStrategy === strategy.id;

            return (
              <div
                key={strategy.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden cursor-pointer"
                onClick={() =>
                  setExpandedStrategy(isExpanded ? null : strategy.id)
                }
              >
                <div className={`h-2 ${strategy.color}`} />
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`p-3 rounded-lg ${strategy.color} bg-opacity-10`}
                    >
                      <Icon
                        className={`w-6 h-6 text-white`}
                        style={{ filter: 'brightness(0) saturate(100%)' }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {strategy.title}
                      </h3>
                      <p className="text-gray-600">{strategy.description}</p>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 space-y-4 animate-fadeIn">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Examples:
                        </h4>
                        <ul className="space-y-1">
                          {strategy.examples.map((ex, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-gray-600 flex items-center gap-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                              {ex}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Implementation Tips:
                        </h4>
                        <ul className="space-y-1">
                          {strategy.implementation.map((tip, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-gray-600 flex items-start gap-2"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 text-sm text-indigo-600 font-medium">
                    {isExpanded ? '▲ Click to collapse' : '▼ Click to expand'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Best Practices */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Star className="w-7 h-7" />
            Best Practices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bestPractices.map((practice, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{practice}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            💡 Remember: Gamification should enhance your app's core value, not
            replace it
          </p>
        </div>
      </div>
    </div>
  );
};

export default GamificationStrategies;
