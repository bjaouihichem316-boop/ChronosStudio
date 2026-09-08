import { ProductionData } from '../../../types/production';
import { Film, Clapperboard, Users, MapPin, Image, CheckCircle, Clock } from 'lucide-react';

interface ProductionOverviewProps {
  data: ProductionData;
}

export default function ProductionOverview({ data }: ProductionOverviewProps) {
  const totalShots = data.shots.length;
  const approvedShots = data.shots.filter((s) => s.status === 'approved').length;
  const totalDuration = data.shots.reduce((sum, s) => sum + s.duration, 0);
  const storyboardProgress = totalShots > 0 ? Math.round((approvedShots / totalShots) * 100) : 0;

  // Production readiness: based on scenes with shots, characters assigned, locations assigned
  const scenesWithShots = data.scenes.filter((s) => s.shotIds.length > 0).length;
  const scenesWithCharacters = data.scenes.filter((s) => s.characterIds.length > 0).length;
  const scenesWithLocations = data.scenes.filter((s) => s.locationId).length;
  const readinessScore = data.scenes.length > 0
    ? Math.round(
        ((scenesWithShots / data.scenes.length) * 40) +
        ((scenesWithCharacters / data.scenes.length) * 30) +
        ((scenesWithLocations / data.scenes.length) * 30)
      )
    : 0;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={Film} label="Scenes" value={data.scenes.length} color="indigo" />
        <StatCard icon={Clapperboard} label="Shots" value={totalShots} color="purple" />
        <StatCard icon={Users} label="Characters" value={data.characters.length} color="emerald" />
        <StatCard icon={MapPin} label="Locations" value={data.locations.length} color="amber" />
        <StatCard icon={Image} label="Assets" value={data.assets.length} color="blue" />
        <StatCard icon={Clock} label="Duration" value={formatDuration(totalDuration)} color="rose" isString />
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProgressCard
          title="Storyboard Progress"
          value={storyboardProgress}
          subtitle={`${approvedShots} of ${totalShots} shots approved`}
          color="indigo"
        />
        <ProgressCard
          title="Production Readiness"
          value={readinessScore}
          subtitle={`${scenesWithShots} scenes with shots, ${scenesWithCharacters} with characters`}
          color="emerald"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-indigo-400" />
          Production Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Shot Status</h4>
            <div className="space-y-2">
              <StatusBar
                label="Approved"
                count={data.shots.filter((s) => s.status === 'approved').length}
                total={totalShots}
                color="emerald"
              />
              <StatusBar
                label="In Review"
                count={data.shots.filter((s) => s.status === 'review').length}
                total={totalShots}
                color="amber"
              />
              <StatusBar
                label="Draft"
                count={data.shots.filter((s) => s.status === 'draft').length}
                total={totalShots}
                color="gray"
              />
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Scene Status</h4>
            <div className="space-y-2">
              <StatusBar
                label="Complete"
                count={data.scenes.filter((s) => s.status === 'complete').length}
                total={data.scenes.length}
                color="emerald"
              />
              <StatusBar
                label="In Progress"
                count={data.scenes.filter((s) => s.status === 'in-progress').length}
                total={data.scenes.length}
                color="amber"
              />
              <StatusBar
                label="Planning"
                count={data.scenes.filter((s) => s.status === 'planning').length}
                total={data.scenes.length}
                color="gray"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  isString = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  color: string;
  isString?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    indigo: 'from-indigo-600/20 to-indigo-600/5 border-indigo-500/20 text-indigo-300',
    purple: 'from-purple-600/20 to-purple-600/5 border-purple-500/20 text-purple-300',
    emerald: 'from-emerald-600/20 to-emerald-600/5 border-emerald-500/20 text-emerald-300',
    amber: 'from-amber-600/20 to-amber-600/5 border-amber-500/20 text-amber-300',
    blue: 'from-blue-600/20 to-blue-600/5 border-blue-500/20 text-blue-300',
    rose: 'from-rose-600/20 to-rose-600/5 border-rose-500/20 text-rose-300',
  };

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br border ${colorClasses[color]}`}>
      <Icon className="w-4 h-4 mb-2 opacity-70" />
      <p className={`text-2xl font-bold ${isString ? 'text-lg' : ''}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  );
}

function ProgressCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: number;
  subtitle: string;
  color: 'indigo' | 'emerald';
}) {
  const barColor = color === 'indigo' ? 'from-indigo-600 to-purple-500' : 'from-emerald-600 to-teal-500';

  return (
    <div className="bg-[#1a1b2e] border border-[#2a2b3d] rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-300">{title}</h3>
        <span className={`text-sm font-bold ${color === 'indigo' ? 'text-indigo-400' : 'text-emerald-400'}`}>
          {value}%
        </span>
      </div>
      <div className="w-full h-2 bg-[#12132a] rounded-full overflow-hidden mb-2" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}

function StatusBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  const colorClasses: Record<string, string> = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    gray: 'bg-gray-500',
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-20">{label}</span>
      <div className="flex-1 h-1.5 bg-[#12132a] rounded-full overflow-hidden">
        <div className={`h-full ${colorClasses[color]} rounded-full`} style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-12 text-right">{count}/{total}</span>
    </div>
  );
}
