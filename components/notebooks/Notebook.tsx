
import React from 'react';
import { useNotebook } from '../../hooks/useNotebook';
import { NotebookSidebar } from './Sidebar';
import { NotebookEditor } from './Editor';

export const Notebook: React.FC = () => {
  const { 
    folders, pages, activePage, activePageId, expandedFolders,
    addFolder, deleteFolder, renameFolder, toggleFolder,
    addPage, deletePage, updatePage, movePage, setActivePageId,
    updateFolder, pinPage
  } = useNotebook();

  // Helper to find folder name for active page
  const activeFolderName = activePage?.folderId 
    ? folders.find(f => f.id === activePage.folderId)?.name 
    : undefined;

  const handleRenamePage = (id: string, title: string) => {
      updatePage(id, { title });
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-panel/50 backdrop-blur-sm rounded-3xl border border-white/40 shadow-sm overflow-hidden transition-colors">
      <NotebookSidebar 
        folders={folders}
        pages={pages}
        activePageId={activePageId}
        expandedFolders={expandedFolders}
        onAddFolder={addFolder}
        onDeleteFolder={deleteFolder}
        onRenameFolder={renameFolder}
        onToggleFolder={toggleFolder}
        onAddPage={addPage}
        onDeletePage={deletePage}
        onSelectPage={setActivePageId}
        onRenamePage={handleRenamePage}
        onMovePage={movePage}
        onUpdateFolder={updateFolder}
        onPinPage={pinPage}
        onUpdatePage={updatePage}
      />
      <NotebookEditor 
        page={activePage}
        folderName={activeFolderName}
        onUpdate={updatePage}
      />
    </div>
  );
};
