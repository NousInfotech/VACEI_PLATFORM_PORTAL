import { createContext, useContext } from 'react';
import type { LibraryItem } from '../data/libraryData';

export type ViewMode = 'list' | 'grid';
export type SortField = 'name' | 'type' | 'size';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export interface ContextMenuState {
  x: number;
  y: number;
  itemId: string;
}

export interface LibraryContextType {
  viewMode: ViewMode;
  currentFolderId: string | null;
  searchQuery: string;
  selectedItems: string[];
  sortConfig: SortConfig;
  contextMenu: ContextMenuState | null;
  filterType: string;
  isLoading: boolean;
  breadcrumbs: LibraryItem[];
  currentItems: LibraryItem[];
  rootFolders: LibraryItem[];
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  setFilterType: (type: string) => void;
  handleFolderClick: (id: string | null) => void;
  handleBack: () => void;
  handleDoubleClick: (item: LibraryItem) => void;
  handleSelection: (id: string, e: React.MouseEvent) => void;
  handleSort: (field: SortField) => void;
  handleContextMenu: (e: React.MouseEvent, itemId: string) => void;
  closeContextMenu: () => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  setSelectedItems: (ids: string[]) => void;
  handleDownload: (item?: LibraryItem) => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};

export { LibraryContext };
