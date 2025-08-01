import React, { useState } from 'react';

interface SetupScreenProps {
  onStart: () => void;
  csvData: string;
  onCsvDataChange: (data: string) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, csvData, onCsvDataChange }) => {
  const [error, setError] = useState<string>('');

  const handleStart = () => {
    if (!csvData.trim()) {
      setError('CSV data cannot be empty.');
      return;
    }
    setError('');
    onStart();
  };

  return (
    <div className="min-h-screen bg-contest-dark flex flex-col items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-4xl bg-contest-dark-light rounded-lg shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-center mb-2 text-contest-gold">IOI Results Unfreeze</h1>
        <p className="text-center text-contest-light-gray mb-6">
          Paste your IOI-style contest results in CSV format below to begin the dramatic reveal.
        </p>
        
        <div className="mb-4">
          <label htmlFor="csv-input" className="block text-sm font-medium text-contest-light-gray mb-2">
            CSV Data Input
          </label>
          <textarea
            id="csv-input"
            rows={12}
            className="w-full p-3 font-mono text-sm bg-gray-900 text-white border border-contest-gray rounded-md focus:ring-2 focus:ring-contest-gold focus:border-contest-gold transition"
            value={csvData}
            onChange={(e) => onCsvDataChange(e.target.value)}
            placeholder="Rank,TeamName,Score,FrozenUpdates..."
            aria-label="CSV Data Input"
          />
        </div>
        
        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">CSV Format Guide</h3>
            <div className="text-sm bg-gray-900 p-4 rounded-md text-contest-light-gray space-y-2">
                <p><strong className="text-white">Columns:</strong> `Rank,TeamName,Score,FrozenUpdates`</p>
                <p><strong className="text-white">FrozenUpdates:</strong> A pipe-separated `|` list. Each update is `Problem,PointsGained,RevealTime`.</p>
                <p><strong className="text-white">Reveal Logic:</strong> The simulation always reveals a submission for the team currently in the <strong className="text-contest-gold">lowest rank</strong>. The `RevealTime` value determines the order of reveals for that specific team if they have multiple pending submissions.</p>
                <p><strong className="text-white">Example:</strong> `A,+50,241|C,+20,265` means for this team, the update for problem A will be revealed before the update for problem C.</p>
            </div>
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
        <div className="text-center">
          <button
            onClick={handleStart}
            className="px-12 py-4 bg-contest-gold text-black font-bold text-xl rounded-lg hover:bg-yellow-400 transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Start Reveal
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;