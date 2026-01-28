import React from 'react';
import { LibraryBig } from 'lucide-react';
import PageHeader from '../../common/PageHeader';
import { LibraryExplorer } from './components/LibraryExplorer';

const GlobalLibrary: React.FC = () => {
    return (
        <div className="space-y-6">
            <PageHeader 
                title="Global Library"
                icon={LibraryBig}
                description="Manage and organize document templates, policy records, and shared assets across the platform."
            />

            <div className="animate-in fade-in duration-700">
                <LibraryExplorer />
            </div>
        </div>
    );
};

export default GlobalLibrary;
