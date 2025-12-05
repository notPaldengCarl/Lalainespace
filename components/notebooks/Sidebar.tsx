
import React, { useState } from 'react';
import { 
  Folder, FolderPlus, FilePlus, ChevronRight, ChevronDown, 
  Trash2, Edit2, Search, Plus, GripVertical, FileText, X 
} from 'lucide-react';
import { NoteFolder, NotePage } from '../../types';
import { Button } from '../Button';

// Safe Swal helper since we're using CDN
const confirmAction = (title: string, text: string, onConfirm: () => void) => {
  if ((window as any).Swal) {
    (window as any).Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      customClass: {
        popup: 'font-sans',
      }
    }).then((result: any) => {
      if (result.isConfirmed) {
        onConfirm();
      }
    });
  } else {
    // Fallback if CDN fails load
    if (window.confirm(`${title}\n${text}`)) {
      onConfirm();
    }
  }
};

const FOLDER_COLORS = [
  'text-accent', 
  'text-rose-500', 
  'text-orange-500', 
  'text-amber-500',
  'text-green-600', 
  'text-blue-500', 
  'text-indigo-500',
  'text-purple-500', 
];

interface SidebarProps {
  folders: NoteFolder[];
  pages: NotePage[];
  activePageId: string;
  expandedFolders: string[];
  onAddFolder: (name: string, color?: string) => void;
  onDeleteFolder: (id: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  onToggleFolder: (id: string) => void;
  onAddPage: (folderId?: string) => void;
  onDeletePage: (id: string) => void;
  onSelectPage: (id: string) => void;
  onRenamePage: (id: string, title: string) => void;
  onMovePage: (pageId: string, folderId?: string) => void;
}

// Robust Action Button that eats all click/mouse events to prevent bubbling
const ActionButton = ({ onClick, icon: Icon, colorClass, title }: any) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick(e);
    }}
    onMouseDown={(e) => {
      e.preventDefault(); // Prevent focus stealing
      e.stopPropagation(); // Prevent drag initiation
    }}
    onDoubleClick={(e) => e.stopPropagation()}
    className={`p-1.5 rounded-md transition-colors z-20 relative cursor-pointer ${colorClass}`}
    title={title}
  >
    <Icon size={14} />
  </button>
);

export const NotebookSidebar: React.FC<SidebarProps> = ({
  folders, pages, activePageId, expandedFolders,
  onAddFolder, onDeleteFolder, onRenameFolder, onToggleFolder,
  onAddPage, onDeletePage, onSelectPage, onRenamePage, onMovePage
}) => {
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('text-accent');
  const [isCreating, setIsCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  // Inline Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editType, setEditType] = useState<'folder' | 'page' | null>(null);
  const [editName, setEditName] = useState('');

  // --- Handlers ---

  const handleCreateSubmit = () => {
    if (newFolderName.trim()) {
      onAddFolder(newFolderName, newFolderColor);
      setNewFolderName('');
      setNewFolderColor('text-accent');
      setIsCreating(false);
    }
  };

  const startEditing = (id: string, name: string, type: 'folder' | 'page') => {
    setEditingId(id);
    setEditName(name);
    setEditType(type);
  };

  const saveEditing = () => {
    if (!editingId) return;
    if (editName.trim()) {
      if (editType === 'folder') onRenameFolder(editingId, editName);
      else onRenamePage(editingId, editName);
    }
    cancelEditing();
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditType(null);
    setEditName('');
  };

  // --- Drag and Drop ---
  const handleDragStart = (e: React.DragEvent, pageId: string) => {
    e.dataTransfer.setData('application/lalaine-page-id', pageId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, folderId: string | 'root') => {
    e.preventDefault(); 
    e.stopPropagation();
    if (dragOverFolderId !== folderId) setDragOverFolderId(folderId);
  };

  const handleDrop = (e: React.DragEvent, targetFolderId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);
    const pageId = e.dataTransfer.getData('application/lalaine-page-id');
    if (pageId) onMovePage(pageId, targetFolderId);
  };

  const filteredPages = pages.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  // --- Render Items ---

  const renderPageItem = (page: NotePage) => {
    const isEditing = editingId === page.id && editType === 'page';
    const isActive = activePageId === page.id;

    return (
      <div 
        key={page.id}
        className={`
          group flex items-center justify-between pl-4 pr-2 py-1.5 text-sm rounded-lg transition-all border border-transparent
          ${isActive ? 'bg-white shadow-sm border-accent/20 text-coffee font-medium' : 'text-mocha hover:bg-white/40 hover:border-white/20'}
        `}
      >
        {/* Content Area - Handles Selection */}
        <div 
          className="flex items-center gap-2 truncate flex-1 min-w-0 cursor-pointer h-full select-none"
          draggable={!isEditing}
          onDragStart={(e) => !isEditing && handleDragStart(e, page.id)}
          onClick={(e) => {
            e.preventDefault();
            if (!isEditing) onSelectPage(page.id);
          }}
        >
          <GripVertical size={12} className="text-mocha/20 opacity-0 group-hover:opacity-100 cursor-grab flex-shrink-0" />
          <span className="opacity-70 flex-shrink-0 text-base leading-none w-5 text-center">
            {page.icon || <FileText size={14} />}
          </span>
          
          {isEditing ? (
             <input 
               autoFocus
               value={editName}
               onChange={e => setEditName(e.target.value)}
               onBlur={saveEditing}
               onKeyDown={e => {
                 if (e.key === 'Enter') saveEditing();
                 if (e.key === 'Escape') cancelEditing();
               }}
               onClick={e => { e.preventDefault(); e.stopPropagation(); }}
               onMouseDown={e => e.stopPropagation()}
               className="flex-1 bg-white border border-accent rounded px-1 py-0.5 text-sm text-coffee outline-none min-w-0"
             />
          ) : (
             <span className="truncate leading-tight">{page.title || 'Untitled'}</span>
          )}
        </div>
        
        {/* Action Buttons - Isolated */}
        {!isEditing && (
          <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity pl-2">
            <ActionButton 
              onClick={() => startEditing(page.id, page.title, 'page')}
              icon={Edit2}
              colorClass="hover:bg-amber-100 hover:text-amber-600 text-mocha/40 md:text-mocha/60"
              title="Rename"
            />
            <ActionButton 
              onClick={() => {
                confirmAction('Delete Page?', 'This page will be permanently removed.', () => onDeletePage(page.id));
              }}
              icon={Trash2}
              colorClass="hover:bg-red-100 hover:text-red-600 text-mocha/40 md:text-mocha/60"
              title="Delete"
            />
          </div>
        )}
      </div>
    );
  };

  const renderFolderItem = (folder: NoteFolder) => {
    const isEditing = editingId === folder.id && editType === 'folder';
    const isOpen = expandedFolders.includes(folder.id);
    const folderPages = filteredPages.filter(p => p.folderId === folder.id);
    const isDragOver = dragOverFolderId === folder.id;
    const folderColor = folder.color || 'text-accent';

    return (
      <div 
        key={folder.id} 
        className={`rounded-xl transition-all duration-200 ${isDragOver ? 'bg-accent/10 ring-2 ring-accent/30 scale-[1.01]' : ''}`}
        onDragOver={(e) => handleDragOver(e, folder.id)}
        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverFolderId(null); }}
        onDrop={(e) => handleDrop(e, folder.id)}
      >
        <div className="flex items-center justify-between group py-1.5 rounded-lg hover:bg-white/40 pr-1 select-none">
          {/* Content Area - Handles Toggle */}
          <div 
            className="flex items-center gap-2 px-2 flex-1 min-w-0 cursor-pointer h-full"
            onClick={(e) => {
               e.preventDefault();
               if (!isEditing) onToggleFolder(folder.id);
            }}
          >
            <span className="text-mocha/40 hover:text-mocha transition-colors">
              {isOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
            </span>
            <Folder size={16} className={`flex-shrink-0 transition-colors ${isDragOver ? 'fill-current opacity-50' : ''} ${folderColor}`} />
            
            {isEditing ? (
               <input 
                 autoFocus
                 value={editName}
                 onChange={e => setEditName(e.target.value)}
                 onBlur={saveEditing}
                 onKeyDown={e => {
                   if (e.key === 'Enter') saveEditing();
                   if (e.key === 'Escape') cancelEditing();
                 }}
                 onClick={e => { e.preventDefault(); e.stopPropagation(); }}
                 onMouseDown={e => e.stopPropagation()}
                 className="flex-1 bg-white border border-accent rounded px-1 py-0.5 text-sm text-coffee outline-none min-w-0"
               />
            ) : (
               <>
                <span className="text-sm font-semibold text-coffee truncate">{folder.name}</span>
                <span className="text-[10px] text-mocha/40 bg-white/30 px-1.5 py-0.5 rounded-full ml-auto">{folderPages.length}</span>
               </>
            )}
          </div>

          {/* Action Buttons - Isolated */}
          {!isEditing && (
            <div className="flex items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity pl-2">
              <ActionButton 
                onClick={() => onAddPage(folder.id)}
                icon={Plus}
                colorClass="text-mocha/40 md:text-mocha/60 hover:text-accent hover:bg-white"
                title="Add Note"
              />
              <ActionButton 
                onClick={() => startEditing(folder.id, folder.name, 'folder')}
                icon={Edit2}
                colorClass="text-mocha/40 md:text-mocha/60 hover:text-amber-600 hover:bg-white"
                title="Rename"
              />
              <ActionButton 
                onClick={() => {
                   confirmAction('Delete Folder?', `Folder "${folder.name}" will be deleted. Notes will move to Unorganized.`, () => onDeleteFolder(folder.id));
                }}
                icon={Trash2}
                colorClass="text-mocha/40 md:text-mocha/60 hover:text-red-500 hover:bg-red-50"
                title="Delete"
              />
            </div>
          )}
        </div>

        {isOpen && (
          <div className="border-l border-mocha/10 ml-3.5 pl-1 my-1 space-y-0.5">
            {folderPages.length === 0 && <div className="px-4 py-2 text-[10px] text-mocha/40 italic">Empty folder<br/>Drag notes here</div>}
            {folderPages.map(renderPageItem)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full md:w-72 bg-panel/50 border-r border-white/50 flex flex-col h-[40vh] md:h-full overflow-hidden flex-shrink-0">
      {/* Header */}
      <div className="p-4 space-y-3 border-b border-white/50 bg-panel/30 flex-shrink-0">
        <div className="relative group">
          <Search size={14} className="absolute left-3 top-2.5 text-mocha/50 group-focus-within:text-accent transition-colors" />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-9 pr-3 py-2 bg-white/60 rounded-xl text-xs outline-none focus:ring-2 focus:ring-accentLight/30 text-coffee placeholder:text-mocha/40 transition-all"
          />
        </div>
        <div className="flex gap-1">
          <Button onClick={() => setIsCreating(!isCreating)} size="sm" variant="secondary" className="flex-1 text-xs px-2 h-8">
            <FolderPlus size={14} className="mr-1.5" /> Folder
          </Button>
          <Button onClick={() => onAddPage()} size="sm" className="flex-1 text-xs px-2 h-8">
            <FilePlus size={14} className="mr-1.5" /> Note
          </Button>
        </div>
        {isCreating && (
          <div className="animate-in slide-in-from-top-2 pt-1 p-2 bg-white/50 rounded-xl border border-white/40 shadow-sm">
             <div className="flex gap-1 mb-2">
                <input 
                  autoFocus
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateSubmit()}
                  className="flex-1 px-2 py-1.5 text-xs rounded-lg bg-white border border-accent/20 outline-none focus:ring-1 focus:ring-accent"
                  placeholder="Folder Name"
                />
             </div>
             
             {/* Color Picker */}
             <div className="flex gap-1.5 mb-2 overflow-x-auto no-scrollbar pb-1">
               {FOLDER_COLORS.map(c => {
                 const bgClass = c.replace('text-', 'bg-');
                 const isSelected = newFolderColor === c;
                 return (
                   <button 
                     key={c}
                     onClick={() => setNewFolderColor(c)}
                     className={`w-4 h-4 rounded-full ${bgClass} ${isSelected ? 'ring-2 ring-coffee ring-offset-1' : 'opacity-70 hover:opacity-100'}`}
                     title="Select Color"
                   />
                 )
               })}
             </div>

             <div className="flex gap-1">
                <button 
                  type="button"
                  onClick={handleCreateSubmit} 
                  className="flex-1 bg-accent text-white px-2 py-1 rounded-lg text-xs font-medium hover:bg-accent/90"
                >
                  Create
                </button>
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)} 
                  className="px-2 py-1 text-mocha hover:bg-white/50 rounded-lg text-xs"
                >
                  Cancel
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {folders.map(renderFolderItem)}

        {/* Root Pages (Unorganized) */}
        <div 
          className={`
            mt-6 pt-2 border-t border-mocha/10 min-h-[60px] rounded-xl transition-all duration-200
            ${dragOverFolderId === 'root' ? 'bg-accent/10 ring-2 ring-accent/30' : ''}
          `}
          onDragOver={(e) => handleDragOver(e, 'root')}
          onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverFolderId(null); }}
          onDrop={(e) => handleDrop(e, undefined)}
        >
          <p className="px-3 text-[10px] font-bold text-mocha/40 uppercase mb-2 tracking-wider">Unorganized</p>
          <div className="space-y-0.5">
            {filteredPages.filter(p => !p.folderId).map(renderPageItem)}
            {filteredPages.filter(p => !p.folderId).length === 0 && (
              <div className="px-3 py-4 border-2 border-dashed border-mocha/10 rounded-lg flex flex-col items-center justify-center text-mocha/30 gap-1">
                 <FilePlus size={16} />
                 <span className="text-[10px] italic">No unorganized notes</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
