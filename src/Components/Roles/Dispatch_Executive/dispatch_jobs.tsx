import React from 'react';
import ReadyDispatchForm from './ReadytoDispatch/readyDispatch';

interface Job {
  id: string;
  company: string;
  jobId: string;
  boardSize: string;
  gsm: string;
  artwork: string;
  approvalDate: string;
  dispatchDate: string;
}

interface DispatchJobsProps {
  jobs?: Job[];
  onReadyDispatch?: () => void;
}

const DispatchJobCard: React.FC<Job & { onReady?: () => void }> = ({
  company,
  jobId,
  boardSize,
  gsm,
  artwork,
  approvalDate,
  dispatchDate,
  onReady,
}) => (
  <div className="max-w-xs w-full rounded-xl border border-blue-200 p-5 bg-white shadow-sm flex flex-col items-center text-gray-900">
    <div className="w-full flex justify-between items-center mb-2">
      <span className="font-bold text-lg">{company}</span>
      <span className="text-gray-500 text-base">{jobId}</span>
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
    <button
      className="w-full bg-[#00AEEF] hover:bg-[#0095cc] text-white font-semibold py-2 rounded-lg transition mt-2"
      onClick={onReady}
    >
      Ready to dispatch
    </button>
  </div>
);

const mockJobs: Job[] = [
  {
    id: '1',
    company: 'Jockey India',
    jobId: 'id_234566',
    boardSize: '64×64',
    gsm: 'xyz',
    artwork: 'id_123456',
    approvalDate: '15/04/2025',
    dispatchDate: '15/04/2025',
  },
  {
    id: '2',
    company: 'Jockey India',
    jobId: 'id_234567',
    boardSize: '64×64',
    gsm: 'xyz',
    artwork: 'id_123457',
    approvalDate: '16/04/2025',
    dispatchDate: '16/04/2025',
  },
  // ...add more jobs as needed
];

const DispatchJobs: React.FC<DispatchJobsProps> = ({ jobs, onReadyDispatch }) => {
  const jobList = jobs || mockJobs;
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4 justify-items-center">
        {jobList.map(job => (
          <DispatchJobCard key={job.id} {...job} onReady={onReadyDispatch} />
        ))}
      </div>
    </div>
  );
};

export default DispatchJobs;
