import React, { useState, useCallback } from 'react';
import { AppPhase, TeamStanding, ScoreUpdate, RevealEvent } from './types';
import SetupScreen from './components/SetupScreen';
import RevealScreen from './components/RevealScreen';
import { SAMPLE_CSV } from './constants';

const parseCSV = (csvData: string): TeamStanding[] => {
  const lines = csvData.trim().split('\n').slice(1); // Skip header
  return lines.map(line => {
    const matches = line.match(/(?:"[^"]*"|[^,]+)/g) || [];
    const [rankStr, teamName, scoreStr, frozenStr] = matches.map(m => m.replace(/"/g, ''));

    const frozenUpdates: ScoreUpdate[] = (frozenStr || '').split('|')
      .filter(s => s)
      .map(updateStr => {
        const [problem, pointsGained, revealTime] = updateStr.split(',');
        return {
          problem,
          pointsGained: parseInt(pointsGained, 10) || 0,
          revealTime: parseInt(revealTime, 10),
        };
      })
      .filter(u => u.problem && !isNaN(u.pointsGained) && !isNaN(u.revealTime))
      // Sort updates for each team by their reveal time
      .sort((a, b) => a.revealTime - b.revealTime);
    
    const scorePreFreeze = parseInt(scoreStr, 10);
    
    return {
      id: teamName,
      initialRank: parseInt(rankStr, 10),
      teamName,
      scorePreFreeze,
      frozenUpdates,
      scoreTotal: scorePreFreeze,
      revealedUpdatesCount: 0,
    };
  }).filter(t => t.id && !isNaN(t.initialRank) && !isNaN(t.scorePreFreeze));
};

const sortTeams = (teamList: TeamStanding[]): TeamStanding[] => {
  return [...teamList].sort((a, b) => {
    // Primary sort: higher score is better
    if (a.scoreTotal !== b.scoreTotal) {
      return b.scoreTotal - a.scoreTotal;
    }
    // Secondary sort: if scores are equal, lower initial rank is better
    if (a.initialRank !== b.initialRank) {
      return a.initialRank - b.initialRank;
    }
    // Tertiary sort: alphabetical by team name for deterministic tie-breaking
    return a.teamName.localeCompare(b.teamName);
  });
};

const App: React.FC = () => {
  const [phase, setPhase] = useState<AppPhase>(AppPhase.SETUP);
  const [teams, setTeams] = useState<TeamStanding[]>([]);
  const [lastReveal, setLastReveal] = useState<RevealEvent | null>(null);
  const [csvData, setCsvData] = useState<string>(SAMPLE_CSV);

  const handleStart = useCallback(() => {
    const parsedTeams = parseCSV(csvData);
    setTeams(sortTeams(parsedTeams));
    setLastReveal(null);
    setPhase(AppPhase.REVEALING);
  }, [csvData]);

  const handleNext = useCallback(() => {
    // Find the lowest-ranked team that still has a pending update.
    // The teams array is sorted high-to-low, so we iterate from the end.
    let targetTeam: TeamStanding | undefined = undefined;
    for (let i = teams.length - 1; i >= 0; i--) {
        const team = teams[i];
        if (team.revealedUpdatesCount < team.frozenUpdates.length) {
            targetTeam = team;
            break;
        }
    }
    
    // If no team found, we are finished.
    if (!targetTeam) {
        setPhase(AppPhase.FINISHED);
        return;
    }

    // Get the next update for this team (they are pre-sorted by revealTime)
    const nextUpdate = targetTeam.frozenUpdates[targetTeam.revealedUpdatesCount];
    setLastReveal({
        teamId: targetTeam.id,
        teamName: targetTeam.teamName,
        update: nextUpdate,
    });

    // Update the team's score and revealed count
    const updatedTeams = teams.map(team => {
      if (team.id === targetTeam!.id) { // Non-null assertion is safe here
        return { 
            ...team, 
            revealedUpdatesCount: team.revealedUpdatesCount + 1,
            scoreTotal: team.scoreTotal + nextUpdate.pointsGained,
        };
      }
      return team;
    });

    const sortedUpdatedTeams = sortTeams(updatedTeams);
    setTeams(sortedUpdatedTeams);
    
    // Check if the contest is over after this reveal
    const isFinished = !sortedUpdatedTeams.some(t => t.revealedUpdatesCount < t.frozenUpdates.length);
    if (isFinished) {
        setPhase(AppPhase.FINISHED);
    }
  }, [teams]);

  const handleReset = () => {
    setPhase(AppPhase.SETUP);
    setTeams([]);
    setLastReveal(null);
    setCsvData(SAMPLE_CSV);
  };

  const handleReconfigure = () => {
    setPhase(AppPhase.SETUP);
  };

  switch (phase) {
    case AppPhase.REVEALING:
    case AppPhase.FINISHED:
      return <RevealScreen teams={teams} onNext={handleNext} onReset={handleReset} onReconfigure={handleReconfigure} isFinished={phase === AppPhase.FINISHED} lastReveal={lastReveal} />;
    case AppPhase.SETUP:
    default:
      return <SetupScreen onStart={handleStart} csvData={csvData} onCsvDataChange={setCsvData} />;
  }
};

export default App;