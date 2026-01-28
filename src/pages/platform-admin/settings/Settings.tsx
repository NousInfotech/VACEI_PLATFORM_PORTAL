import React from 'react';
import { Settings as SettingsIcon, Hammer } from 'lucide-react';
import PageHeader from '../../common/PageHeader';

const Settings: React.FC = () => {
    return (
        <div className="space-y-6">
            <PageHeader 
                title="Settings"
                icon={SettingsIcon}
                description="Manage your platform preferences and system configurations."
            />

            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl border border-dashed border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                    <Hammer className="w-10 h-10 text-primary animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Under Development</h2>
                <p className="text-gray-500 max-w-md text-center">
                    We're working hard to bring you the best settings experience. This feature will be available in a future update.
                </p>
                <div className="mt-8 flex gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/20" />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                </div>
            </div>
        </div>
    );
};

export default Settings;
