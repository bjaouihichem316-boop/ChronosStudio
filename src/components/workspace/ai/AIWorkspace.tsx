import { useState } from 'react';
import { AIData, GenerationRequest, GenerationJob } from '../../../types/ai';
import { ResearchData } from '../../../types/research';
import { ScriptData } from '../../../types/script';
import { ProductionData } from '../../../types/production';
import { Project } from '../../../types';
import { Sparkles, FileText, Briefcase, Eye, Settings } from 'lucide-react';
import AIOverview from './AIOverview';
import GenerationRequests from './GenerationRequests';
import GenerationJobs from './GenerationJobs';
import ContextInspector from './ContextInspector';
import RequestCreator from './RequestCreator';

type AITab = 'overview' | 'requests' | 'jobs' | 'inspector' | 'settings';

interface AIWorkspaceProps {
  data: AIData;
  project: Project;
  researchData: ResearchData;
  scriptData: ScriptData;
  productionData: ProductionData;
  onUpdateData: (data: AIData) => void;
}

export default function AIWorkspace({
  data,
  project,
  researchData,
  scriptData,
  productionData,
  onUpdateData,
}: AIWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<AITab>('overview');
  const [selectedRequest, setSelectedRequest] = useState<GenerationRequest | null>(null);
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Sparkles },
    { id: 'requests' as const, label: 'Requests', icon: FileText },
    { id: 'jobs' as const, label: 'Jobs', icon: Briefcase },
    { id: 'inspector' as const, label: 'Context Inspector', icon: Eye },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  const handleCreateRequest = (request: GenerationRequest) => {
    onUpdateData({
      ...data,
      requests: [...data.requests, request],
      lastSaved: new Date().toISOString(),
    });
    setIsCreatingRequest(false);
  };

  const handleUpdateRequest = (updatedRequest: GenerationRequest) => {
    onUpdateData({
      ...data,
      requests: data.requests.map((r) =>
        r.id === updatedRequest.id ? updatedRequest : r
      ),
      lastSaved: new Date().toISOString(),
    });
  };

  const handleDeleteRequest = (requestId: string) => {
    onUpdateData({
      ...data,
      requests: data.requests.filter((r) => r.id !== requestId),
      lastSaved: new Date().toISOString(),
    });
  };

  const handleCreateJob = (job: GenerationJob) => {
    onUpdateData({
      ...data,
      jobs: [...data.jobs, job],
      requests: data.requests.map((r) =>
        r.id === job.requestId
          ? { ...r, jobIds: [...r.jobIds, job.id] }
          : r
      ),
      lastSaved: new Date().toISOString(),
    });
  };

  const handleUpdateJob = (updatedJob: GenerationJob) => {
    onUpdateData({
      ...data,
      jobs: data.jobs.map((j) =>
        j.id === updatedJob.id ? updatedJob : j
      ),
      lastSaved: new Date().toISOString(),
    });
  };

  const handleDeleteJob = (jobId: string) => {
    const job = data.jobs.find((j) => j.id === jobId);
    if (!job) return;

    onUpdateData({
      ...data,
      jobs: data.jobs.filter((j) => j.id !== jobId),
      requests: data.requests.map((r) =>
        r.id === job.requestId
          ? { ...r, jobIds: r.jobIds.filter((id) => id !== jobId) }
          : r
      ),
      lastSaved: new Date().toISOString(),
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-[#2a2b3d] bg-[#12132a] px-6 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Generation Center</h1>
            <p className="text-sm text-gray-400">Manage generation requests and jobs</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1" role="tablist">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1b2e]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && (
          <AIOverview
            data={data}
            onCreateRequest={() => setIsCreatingRequest(true)}
            onSelectRequest={setSelectedRequest}
          />
        )}

        {activeTab === 'requests' && (
          <GenerationRequests
            requests={data.requests}
            jobs={data.jobs}
            onCreateRequest={() => setIsCreatingRequest(true)}
            onSelectRequest={setSelectedRequest}
            onDeleteRequest={handleDeleteRequest}
          />
        )}

        {activeTab === 'jobs' && (
          <GenerationJobs
            jobs={data.jobs}
            requests={data.requests}
            onCreateJob={handleCreateJob}
            onUpdateJob={handleUpdateJob}
            onDeleteJob={handleDeleteJob}
          />
        )}

        {activeTab === 'inspector' && (
          <ContextInspector
            request={selectedRequest}
            onSelectRequest={setSelectedRequest}
            requests={data.requests}
          />
        )}

        {activeTab === 'settings' && (
          <div className="text-center py-12">
            <Settings className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">AI settings will be available in a future stage.</p>
          </div>
        )}
      </div>

      {/* Request Creator Modal */}
      {isCreatingRequest && (
        <RequestCreator
          project={project}
          researchData={researchData}
          scriptData={scriptData}
          productionData={productionData}
          onCreateRequest={handleCreateRequest}
          onCancel={() => setIsCreatingRequest(false)}
        />
      )}
    </div>
  );
}
