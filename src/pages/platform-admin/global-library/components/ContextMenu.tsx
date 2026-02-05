import React from 'react';
import { Download, Eye, Pencil, Trash2 } from 'lucide-react';
import { useLibrary } from '../../../../context/useLibrary';

export const ContextMenu: React.FC = () => {
  const { 
    contextMenu, 
    closeContextMenu, 
    currentItems, 
    handleDownload, 
    handleDoubleClick,
    renameItem,
    deleteItems
  } = useLibrary();
  
  if (!contextMenu) return null;

  const item = currentItems.find((i) => i.id === contextMenu.itemId);
  if (!item) return null;

  const handleRename = async () => {
    const newName = prompt('Enter new name:', item.name);
    if (newName && newName !== item.name) {
      try {
        await renameItem(item.id, newName, item.type);
      } catch (err) {
        alert('Failed to rename item');
        console.error(err);
      }
    }
    closeContextMenu();
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        await deleteItems([item.id]);
      } catch (err) {
        alert('Failed to delete item');
        console.error(err);
      }
    }
    closeContextMenu();
  };

  return (
    <div 
      className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-2xl py-1.5 w-48 animate-in fade-in zoom-in duration-100"
      style={{ left: contextMenu.x, top: contextMenu.y }}
      onClick={(e) => e.stopPropagation()}
    >
      <button 
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors text-left"
        onClick={() => { handleDownload(item); closeContextMenu(); }}
      >
        <Download className="w-4 h-4" />
        Download {item.type === 'folder' ? 'Folder' : ''}
      </button>

      {item.type === 'file' && (item.fileType === 'PDF' || ['PNG', 'JPG', 'JPEG'].includes(item.fileType || '')) && (
        <button 
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors text-left"
          onClick={() => { handleDoubleClick(item); closeContextMenu(); }}
        >
          <Eye className="w-4 h-4" />
          Quick View
        </button>
      )}

      <div className="my-1 border-t border-gray-100" />

      <button 
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors text-left"
        onClick={handleRename}
      >
        <Pencil className="w-4 h-4" />
        Rename
      </button>

      <button 
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
        onClick={handleDelete}
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  );
};
