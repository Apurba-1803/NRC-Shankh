import React, { useState } from 'react';

interface JobCardProps {
  company: string;
  jobId: string;
  boardSize: string;
  gsm: string;
  artwork: string;
  approvalDate: string;
  dispatchDate: string;
  onStop?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({
  company,
  jobId,
  boardSize,
  gsm,
  artwork,
  approvalDate,
  dispatchDate,
  onStop,
}) => {
  const [status, setStatus] = useState<'idle' | 'started'>('idle');

  return (
    <div className="max-w-xs w-full rounded-xl border border-blue-200 p-5 bg-white shadow-sm flex flex-col items-center text-gray-900">
      <div className="w-full flex justify-between items-center mb-2">
        <span className="font-bold text-lg">{company}</span>
        <span
          className={
            status === 'started'
              ? 'text-green-500 font-semibold text-base animate-pulse '
              : 'text-gray-500 text-base'
          }
        >
          {jobId}
        </span>
      </div>
      <div className="w-full text-base mt-2 mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-gray-700">Board Size</span>
          <span className="font-medium">{boardSize}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-700">GSM</span>
          <span className="font-medium">{gsm}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-700">Artwork</span>
          <span className="font-medium">{artwork}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-700">Approval date</span>
          <span className="font-medium">{approvalDate}</span>
        </div>
        <div className="flex justify-between mb-4">
          <span className="text-gray-700">Dispatch date</span>
          <span className="font-medium">{dispatchDate}</span>
        </div>
      </div>
      {/* Buttons */}
      {status === 'idle' ? (
        <button
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition mt-2"
          onClick={() => setStatus('started')}
        >
          Start
        </button>
      ) : (
        <div className="w-full flex gap-3">
          <button className="flex-1 bg-orange-400 hover:bg-orange-500 text-white font-semibold py-2 rounded-lg transition mt-2">
            Pause
          </button>
          <button
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition mt-2"
            onClick={onStop}
          >
            Stop
          </button>
        </div>
      )}
    </div>
  );
};

export default JobCard;
