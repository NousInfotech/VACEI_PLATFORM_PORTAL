import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState, useMemo, useEffect } from 'react';
import { type LibraryItem, formatFileSize } from '../data/libraryData';
import { LibraryContext, type SortConfig } from './useLibrary';
import { apiGet, apiPost, apiPatch, apiDelete } from '../config/base';
import { endPoints } from '../config/endPoint';
import axiosInstance from '../config/axiosConfig';

interface LibraryRootApiItem {
  id: string;
  name?: string;
  folder_name?: string;
  updatedAt?: string;
  rootType?: string;
}

interface LibraryContentFolder extends LibraryRootApiItem {
  parentId?: string | null;
}

interface LibraryContentFile {
  id: string;
  filename?: string;
  file_name?: string;
  type?: string;
  file_type?: string;
  size?: number;
  file_size?: number;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface LibraryContentResponse {
  folder: LibraryContentFolder | null;
  folders: LibraryContentFolder[];
  files: LibraryContentFile[];
}

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [navigationPath, setNavigationPath] = useState<{ id: string; name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', order: 'asc' });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; itemId: string } | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { data: rootsData, isLoading: isLoadingRoots } = useQuery({
    queryKey: ['library-roots'],
    queryFn: () => apiGet<{ data: LibraryRootApiItem[] }>(endPoints.LIBRARY.ROOTS)
  });

  const { data: contentData, isLoading: isLoadingContent } = useQuery<{ data: LibraryContentResponse }>({
    queryKey: ['library-content', currentFolderId],
    queryFn: () => currentFolderId 
      ? apiGet<{ data: LibraryContentResponse }>(endPoints.LIBRARY.FOLDER_CONTENT(currentFolderId))
      : Promise.resolve({
          data: {
            folder: null,
            folders: (rootsData?.data ?? []).map(root => ({
              ...root,
              parentId: null
            })),
            files: []
          }
        }),
    enabled: !!rootsData || currentFolderId !== null
  });

  const isLoading = isLoadingRoots || isLoadingContent;

  const closeContextMenu = () => setContextMenu(null);

  useEffect(() => {
    window.addEventListener('click', closeContextMenu);
    return () => window.removeEventListener('click', closeContextMenu);
  }, []);

  // Mutations
  const createFolderMutation = useMutation({
    mutationFn: (name: string) => apiPost(endPoints.LIBRARY.FOLDERS, { 
      folder_name: name, 
      parentId: currentFolderId,
      rootType: contentData?.data?.folder?.rootType || 'PLATFORM'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-content', currentFolderId] });
      queryClient.invalidateQueries({ queryKey: ['library-roots'] });
    }
  });

  const uploadFilesMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('file', file);
      });
      formData.append('folderId', currentFolderId || '');
      
      const response = await axiosInstance.post(endPoints.LIBRARY.FILE_UPLOAD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-content', currentFolderId] });
    }
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, newName, type }: { id: string, newName: string, type: 'folder' | 'file' }) => {
      const endpoint = type === 'folder' 
        ? endPoints.LIBRARY.FOLDER_BY_ID(id) 
        : endPoints.LIBRARY.FILE_BY_ID(id);
      const data: Record<string, unknown> = type === 'folder' ? { folder_name: newName } : { file_name: newName };
      return apiPatch(endpoint, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-content', currentFolderId] });
      queryClient.invalidateQueries({ queryKey: ['library-roots'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) {
        const item = currentItems.find(i => i.id === id);
        if (!item) continue;
        const endpoint = item.type === 'folder' 
          ? endPoints.LIBRARY.FOLDER_BY_ID(id) 
          : endPoints.LIBRARY.FILE_BY_ID(id);
        await apiDelete(endpoint);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-content', currentFolderId] });
      queryClient.invalidateQueries({ queryKey: ['library-roots'] });
      setSelectedItems([]);
    }
  });

  const breadcrumbs = useMemo(() => {
    return navigationPath.map(p => ({
      id: p.id,
      name: p.name,
      type: 'folder'
    })) as LibraryItem[];
  }, [navigationPath]);

  const currentItems: LibraryItem[] = (() => {
    if (!contentData?.data) return [];
    const { folders = [], files = [] } = contentData.data;

    const folderItems = folders.map((f: LibraryContentFolder) => ({
      ...f,
      id: f.id,
      folder_name: f.name ?? f.folder_name ?? '',
      type: 'folder',
      name: f.name ?? f.folder_name ?? '',
      fileType: 'Folder',
      size: '',
      updatedAt: f.updatedAt ? new Date(f.updatedAt).toLocaleDateString() : undefined,
    }));

    const fileItems = files.map((f: LibraryContentFile) => ({
      ...f,
      id: f.id,
      file_name: f.filename ?? f.file_name ?? '',
      type: 'file',
      name: f.filename ?? f.file_name ?? '',
      fileType: f.type ?? f.file_type,
      size: formatFileSize(f.size ?? f.file_size ?? 0),
      updatedAt: new Date(f.createdAt ?? f.updatedAt ?? '').toLocaleDateString(),
    }));

    const all: LibraryItem[] = [...folderItems, ...fileItems] as LibraryItem[];

    const filtered = all.filter(item => {
      const itemName = item.name || '';
      const matchesSearch = searchQuery === '' || itemName.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesFilter = true;
      if (item.type === 'file' && filterType !== 'all') {
        if (filterType === 'pdf') {
          matchesFilter = item.fileType?.toUpperCase() === 'PDF';
        } else if (filterType === 'spreadsheet') {
          matchesFilter = item.fileType?.toUpperCase() === 'XLSX' || item.fileType?.toUpperCase() === 'CSV';
        } else if (filterType === 'document') {
          matchesFilter = item.fileType?.toUpperCase() === 'DOCX' || item.fileType?.toUpperCase() === 'DOC';
        }
      }
      return matchesSearch && matchesFilter;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      const nameA = a.name || '';
      const nameB = b.name || '';
      const typeA = a.fileType || '';
      const typeB = b.fileType || '';
      const sizeA = a.size || '';
      const sizeB = b.size || '';

      if (sortConfig.field === 'name') {
        comparison = nameA.localeCompare(nameB);
      } else if (sortConfig.field === 'type') {
        comparison = typeA.localeCompare(typeB);
      } else if (sortConfig.field === 'size') {
        comparison = sizeA.localeCompare(sizeB);
      }
      return sortConfig.order === 'asc' ? comparison : -comparison;
    });

    return filtered as LibraryItem[];
  })();

  const rootFolders = (rootsData?.data ?? []).map((f: LibraryRootApiItem) => ({
    ...f,
    id: f.id,
    folder_name: f.name ?? f.folder_name ?? '',
    name: f.name ?? f.folder_name ?? '',
    type: 'folder' as const,
  })) as LibraryItem[];

  const handleFolderClick = (id: string | null, name?: string) => {
    if (id === null) {
      setNavigationPath([]);
    } else {
      const existingIndex = navigationPath.findIndex((p) => p.id === id);
      if (existingIndex !== -1) {
        setNavigationPath(navigationPath.slice(0, existingIndex + 1));
      } else if (name) {
        setNavigationPath([...navigationPath, { id, name }]);
      }
    }
    setCurrentFolderId(id);
    setSelectedItems([]);
    setContextMenu(null);
  };

  const handleBack = () => {
    if (navigationPath.length > 1) {
      const parent = navigationPath[navigationPath.length - 2];
      handleFolderClick(parent.id, parent.name);
    } else {
      handleFolderClick(null);
    }
  };

  const handleDoubleClick = (item: LibraryItem) => {
    if (item.type === 'folder') {
      handleFolderClick(item.id, item.name);
    } else {
      const isExcel = item.fileType?.toUpperCase() === 'XLSX' || item.fileType?.toUpperCase() === 'CSV';
      if (isExcel) {
        handleDownload(item);
      } else if (item.url) {
        window.open(item.url, '_blank');
      }
    }
  };

  const handleDownload = async (item?: LibraryItem) => {
    let itemsToDownload: LibraryItem[] = [];

    if (item) {
      if (item.type === 'folder') {
        // Use backend ZIP download for folders
        try {
          const response = await axiosInstance.get(endPoints.LIBRARY.FOLDER_DOWNLOAD(item.id), {
            responseType: 'blob',
          });
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${item.name || 'folder'}.zip`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Folder download failed:', error);
          alert('Failed to download folder.');
        }
        return;
      } else {
        itemsToDownload = [item];
      }
    } else if (selectedItems.length > 0) {
      itemsToDownload = currentItems.filter((i) => selectedItems.includes(i.id));
      // If multiple items are selected and contain a folder, we might want to ZIP them all,
      // but for now let's handle them individually or just the files.
    } else {
      itemsToDownload = currentItems.filter((i) => i.type === 'file');
    }

    const filesToDownload = itemsToDownload.filter((i) => i.type === 'file');

    if (filesToDownload.length === 0) {
      alert('No files found to download.');
      return;
    }

    for (const i of filesToDownload) {
      const itemName = i.name || i.file_name || 'download';
      const itemUrl = i.url;

      if (!itemUrl) {
        console.warn(`No URL found for item: ${itemName}`);
        continue;
      }

      console.log(`Downloading ${itemName}...`);
      
      // Use a simple hidden link approach for better browser compatibility without CORS issues
      const link = document.createElement('a');
      link.href = itemUrl;
      link.setAttribute('download', itemName);
      link.setAttribute('target', '_blank'); // Open in new tab to trigger download or view
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Add a small delay between downloads to prevent browser from blocking them
      if (filesToDownload.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  };

  const handleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setContextMenu(null);
    if (e.ctrlKey || e.metaKey) {
      setSelectedItems(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    } else {
      setSelectedItems(prev => (prev.length === 1 && prev[0] === id) ? [] : [id]);
    }
  };

  const handleSort = (field: 'name' | 'type' | 'size') => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleContextMenu = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, itemId });
    if (!selectedItems.includes(itemId)) {
      setSelectedItems([itemId]);
    }
  };

  const value = {
    viewMode, setViewMode,
    currentFolderId,
    searchQuery, setSearchQuery,
    selectedItems, setSelectedItems,
    sortConfig,
    contextMenu,
    filterType, setFilterType,
    isLoading,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    breadcrumbs,
    currentItems,
    rootFolders,
    handleFolderClick,
    handleBack,
    handleDoubleClick,
    handleSelection,
    handleSort,
    handleContextMenu,
    closeContextMenu,
    handleDownload,
    createFolder: async (name: string) => { await createFolderMutation.mutateAsync(name); },
    uploadFiles: async (files: FileList) => { await uploadFilesMutation.mutateAsync(files); },
    renameItem: async (id: string, newName: string, type: 'folder' | 'file') => { 
      await renameMutation.mutateAsync({ id, newName, type }); 
    },
    deleteItems: async (ids: string[]) => { await deleteMutation.mutateAsync(ids); }
  };

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};

