import { Settings } from "lucide-react";

export default function DashboardSettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Account and notification preferences.</p>
      </div>
      <div className="card flex flex-col items-center justify-center py-24 text-center max-w-2xl">
        <Settings size={48} className="text-gray-600 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Coming Soon</h3>
        <p className="text-gray-500 text-sm">Account settings will be available here.</p>
      </div>
    </div>
  );
}
