import React from 'react';
import { TeamStanding } from '../types';
import { ROW_HEIGHT } from '../constants';

interface TeamRowProps {
  team: TeamStanding;
  rank: number;
  isHighlighted: boolean;
  isFullyRevealed: boolean;
}

const RankIndicator: React.FC<{ rank: number }> = ({ rank }) => {
    const medalColor = 
        rank === 1 ? 'bg-contest-gold text-black' :
        rank === 2 ? 'bg-contest-silver text-black' :
        rank === 3 ? 'bg-contest-bronze text-black' :
        'bg-contest-gray text-white';

    return (
        <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-lg font-bold ${medalColor}`}>
            {rank}
        </div>
    );
};


const TeamRow: React.FC<TeamRowProps> = ({ team, rank, isHighlighted, isFullyRevealed }) => {
  const topPosition = (rank - 1) * ROW_HEIGHT;
  
  const getRowBgColor = () => {
      if (isHighlighted) {
        return 'bg-blue-900/50 scale-105 shadow-2xl z-20';
      }
      if (isFullyRevealed) {
        return 'bg-green-900/30 z-10'; 
      }
      return 'bg-contest-dark-light/80 z-10';
  };

  return (
    <div
      className={`absolute w-full px-4 rounded-lg flex items-center transition-all duration-700 ease-in-out ${getRowBgColor()}`}
      style={{ 
          top: `${topPosition}px`,
          height: `${ROW_HEIGHT - 8}px`
      }}
    >
        <div className="w-16 flex justify-center">
            <RankIndicator rank={rank} />
        </div>
        <div className="w-16 text-center text-2xl font-light text-contest-light-gray">{team.initialRank}</div>
        <div className="flex-1 font-semibold text-xl truncate pr-4">{team.teamName}</div>
        <div className="w-32 text-center font-mono text-3xl font-bold">{team.scoreTotal}</div>
        <div className="w-48 flex items-center justify-end space-x-3">
            {team.frozenUpdates.map((update, index) => {
                 const revealed = index < team.revealedUpdatesCount;
                 const points = update.pointsGained;
                 return (
                     <div key={index} className={`flex items-center justify-center h-10 w-14 rounded-md font-mono transition-colors duration-300 ${revealed ? (points > 0 ? 'bg-green-800/80' : 'bg-gray-600/70') : 'bg-contest-gray/50'}`} title={`Problem ${update.problem}`}>
                        <div className="flex flex-col items-center justify-center text-white">
                           <span className="text-xs font-bold">{update.problem}</span>
                           {revealed && <span className="text-sm font-bold">{points > 0 ? `+${points}`: `+0`}</span>}
                        </div>
                     </div>
                 );
            })}
        </div>
    </div>
  );
};

export default TeamRow;