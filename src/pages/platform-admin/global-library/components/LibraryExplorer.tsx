import React, { useEffect } from 'react';
import { FolderIcon } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { LibraryProvider } from '../../../../context/LibraryContext';
import { useLibrary } from '../../../../context/useLibrary';

// Modular Components
import { Toolbar } from './Toolbar';
import { Sidebar } from './Sidebar';
import { Breadcrumbs } from './Breadcrumbs';
import { ListView } from './ListView';
import { GridView } from './GridView';
import { ContextMenu } from './ContextMenu';
import { ListViewSkeleton } from './ListViewSkeleton';
import { GridViewSkeleton } from './GridViewSkeleton';

interface LibraryExplorerProps {
  className?: string;
}

const LibraryContent: React.FC = () => {
  const { 
    viewMode, 
    isLoading, 
    currentItems, 
    setSelectedItems, 
    closeContextMenu,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
  } = useLibrary();

  // Keyboard Shortcuts (Ctrl + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        setSelectedItems(currentItems.map((item) => item.id));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentItems, setSelectedItems]);

  return (
    <>
      <Toolbar />
      <Breadcrumbs />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="lg:hidden absolute inset-0 bg-black/20 backdrop-blur-[2px] z-30 animate-in fade-in duration-200"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        <div className={cn(
          "absolute lg:relative z-40 h-full transition-transform duration-300 transform lg:translate-x-0 border-r border-gray-200 min-w-[240px] bg-white",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <Sidebar />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0" onClick={() => { setSelectedItems([]); closeContextMenu(); }}>
            <div className="flex-1 overflow-auto">
                <div className="p-4 md:p-6" onClick={(e) => e.stopPropagation()}>
                    {isLoading ? (
                        viewMode === 'list' ? <ListViewSkeleton /> : <GridViewSkeleton />
                    ) : currentItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
                            <FolderIcon className="w-16 h-16 opacity-10 mb-4" />
                            <p className="text-sm font-medium">No items found</p>
                        </div>
                    ) : viewMode === 'list' ? (
                        <ListView />
                    ) : (
                        <GridView />
                    )}
                </div>
            </div>
        </div>
      </div>

      <ContextMenu />
    </>
  );
};

export const LibraryExplorer: React.FC<LibraryExplorerProps> = ({ className }) => {
  return (
    <div className={cn("flex flex-col h-[600px] md:h-[700px] lg:h-[800px] bg-white border border-gray-200 rounded-2xl overflow-hidden", className)}>
      <LibraryProvider>
        <LibraryContent />
      </LibraryProvider>
    </div>
  );
};
