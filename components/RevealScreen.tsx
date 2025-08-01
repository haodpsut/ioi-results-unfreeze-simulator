import React from 'react';
import { TeamStanding, RevealEvent } from '../types';
import TeamRow from './TeamRow';
import { ROW_HEIGHT } from '../constants';
import { TrendingUpIcon, MinusCircleIcon } from './icons';

interface RevealScreenProps {
  teams: TeamStanding[];
  onNext: () => void;
  onReset: () => void;
  onReconfigure: () => void;
  isFinished: boolean;
  lastReveal: RevealEvent | null;
}

const RevealModal: React.FC<{ reveal: RevealEvent }> = ({ reveal }) => {
    const points = reveal.update.pointsGained;
    const isPositive = points > 0;

    const Icon = isPositive ? TrendingUpIcon : MinusCircleIcon;
    const color = isPositive ? "text-contest-ac" : "text-contest-light-gray";
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-contest-dark-light border-2 border-contest-gray rounded-xl shadow-2xl p-8 max-w-lg w-full text-center animate-pop">
                 <p className="text-lg text-contest-light-gray">Score update for</p>
                 <h2 className="text-4xl font-bold my-2 truncate">{reveal.teamName}</h2>
                 <p className="text-2xl text-contest-light-gray">on Problem <span className="font-bold text-white">{reveal.update.problem}</span></p>

                 <div className="my-8 flex flex-col items-center justify-center">
                    <Icon className={`w-24 h-24 ${color}`} />
                    <p className={`text-5xl font-extrabold mt-4 ${color}`}>
                        {points > 0 ? `+${points}` : '+0'} POINTS
                    </p>
                 </div>
            </div>
        </div>
    )
}

const RevealScreen: React.FC<RevealScreenProps> = ({ teams, onNext, onReset, onReconfigure, isFinished, lastReveal }) => {
  const [showModal, setShowModal] = React.useState(false);

  React.useEffect(() => {
    if (lastReveal) {
      setShowModal(true);
      const timer = setTimeout(() => setShowModal(false), 2500); // Modal visible for 2.5 seconds
      return () => clearTimeout(timer);
    }
  }, [lastReveal]);

  // Handle keyboard controls for advancing the reveal
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault(); // Prevent page scroll
        // Trigger next only if the contest is not finished and the modal is not showing
        if (!isFinished && !showModal) {
          onNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onNext, isFinished, showModal]);
  
  const leaderboardHeight = teams.length * ROW_HEIGHT;

  return (
    <div className="min-h-screen bg-contest-dark flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
        {lastReveal && showModal && <RevealModal reveal={lastReveal} />}

        <header className="w-full max-w-7xl mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-contest-gold">Final Standings</h1>
            <div className="flex space-x-4">
                <button
                    onClick={onReconfigure}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-colors"
                    aria-label="Reconfigure CSV data"
                >
                    Reconfigure
                </button>
                <button
                    onClick={onReset}
                    className="px-4 py-2 bg-contest-gray text-white font-semibold rounded hover:bg-contest-dark-light transition-colors"
                >
                    Reset
                </button>
            </div>
        </header>

        <main className="w-full max-w-7xl flex-1">
             {/* Header Row */}
            <div className="flex items-center px-4 h-12 rounded-t-lg bg-black/30 text-contest-light-gray font-bold">
                <div className="w-16 text-center">Rank</div>
                <div className="w-16 text-center">Start</div>
                <div className="flex-1">Team Name</div>
                <div className="w-32 text-center">Score</div>
                <div className="w-48 text-right pr-4">Score Updates</div>
            </div>

            {/* Leaderboard */}
            <div className="relative" style={{ height: `${leaderboardHeight}px` }}>
                {teams.map((team, index) => {
                    const isFullyRevealed = team.frozenUpdates.length > 0 && team.revealedUpdatesCount === team.frozenUpdates.length;
                    return (
                        <TeamRow
                            key={team.id}
                            team={team}
                            rank={index + 1}
                            isHighlighted={lastReveal?.teamId === team.id}
                            isFullyRevealed={isFullyRevealed}
                        />
                    );
                })}
            </div>
        </main>

        <footer className="w-full max-w-7xl mt-6">
            {isFinished ? (
                 <div className="text-center p-8 bg-contest-dark-light rounded-lg animate-fadeIn">
                    <h2 className="text-4xl font-bold text-contest-gold">CONTEST IS OVER!</h2>
                    <p className="text-xl mt-2 text-contest-light-gray">Congratulations to all teams!</p>
                 </div>
            ) : (
                <div className="text-center">
                    <button
                        onClick={onNext}
                        disabled={showModal}
                        className="px-16 py-5 bg-contest-ac text-white font-bold text-2xl rounded-lg transform hover:scale-105 transition-transform duration-300 shadow-lg disabled:bg-contest-gray disabled:cursor-not-allowed"
                    >
                        NEXT
                    </button>
                    <p className="mt-4 text-sm text-contest-light-gray/80 animate-fadeIn" style={{ animationDelay: '500ms', opacity: 0}}>
                        or press the <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded-md shadow-sm">↓</kbd> key to advance
                    </p>
                </div>
            )}
        </footer>
    </div>
  );
};

export default RevealScreen;