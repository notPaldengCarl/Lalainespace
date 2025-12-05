
import { useState, useEffect, useCallback } from 'react';
import { NoteFolder, NotePage } from '../types';

// Helper for unique IDs to prevent collisions
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 5);

export const useNotebook = () => {
  // --- Load Data ---
  const [folders, setFolders] = useState<NoteFolder[]>(() => {
    try {
      const saved = localStorage.getItem('lalaine_notebook_folders');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [pages, setPages] = useState<NotePage[]>(() => {
    try {
      const saved = localStorage.getItem('lalaine_notebook_pages');
      // Default welcome page if empty
      return saved ? JSON.parse(saved) : [
        { 
          id: 'welcome_note', 
          title: 'Welcome', 
          icon: '👋', 
          content: '# Welcome\n\nThis is your new notebook.\n\n- [ ] Try creating a folder\n- [ ] Drag this note into it\n- [ ] Write your thoughts', 
          updatedAt: Date.now() 
        }
      ];
    } catch (e) { return []; }
  });

  const [activePageId, setActivePageId] = useState<string>('');
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);

  // Initialize active page if none selected and pages exist
  useEffect(() => {
    if (!activePageId && pages.length > 0) {
      setActivePageId(pages[0].id);
    }
  }, [pages.length, activePageId]);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('lalaine_notebook_folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('lalaine_notebook_pages', JSON.stringify(pages));
  }, [pages]);

  // --- Folder Operations ---
  const addFolder = useCallback((name: string, color: string = 'text-accent') => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      // Alert handled by UI component via SWAL now
      return;
    }
    
    if (folders.some(f => f.name.toLowerCase() === trimmedName.toLowerCase())) {
      // Duplicate check could trigger SWAL in UI, but simple return here allows silent fail or we can add a callback
      return;
    }

    const newFolder: NoteFolder = { 
        id: generateId(), 
        name: trimmedName, 
        color, 
        createdAt: Date.now() 
    };
    setFolders(prev => [...prev, newFolder]);
    setExpandedFolders(prev => [...prev, newFolder.id]); 
  }, [folders]);

  const deleteFolder = useCallback((id: string) => {
    // 1. Move pages inside this folder to root (undefined)
    setPages(prev => prev.map(p => p.folderId === id ? { ...p, folderId: undefined } : p));
    // 2. Remove the folder
    setFolders(prev => prev.filter(f => f.id !== id));
    // 3. Remove from expanded state
    setExpandedFolders(prev => prev.filter(fid => fid !== id));
  }, []);

  const renameFolder = useCallback((id: string, newName: string) => {
    const trimmedName = newName.trim();
    if (!trimmedName) return; 

    setFolders(prev => prev.map(f => f.id === id ? { ...f, name: trimmedName } : f));
  }, []);
  
  const updateFolder = useCallback((id: string, updates: Partial<NoteFolder>) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }, []);

  const toggleFolder = useCallback((id: string) => {
    setExpandedFolders(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  }, []);

  // --- Page Operations ---
  const addPage = useCallback((folderId?: string) => {
    const newPage: NotePage = {
      id: generateId(),
      title: 'Untitled',
      icon: '📄',
      content: '',
      updatedAt: Date.now(),
      folderId
    };
    
    setPages(prev => [newPage, ...prev]);
    setActivePageId(newPage.id);
    
    if (folderId) {
      setExpandedFolders(prev => prev.includes(folderId) ? prev : [...prev, folderId]);
    }
  }, []);

  const movePage = useCallback((pageId: string, folderId?: string) => {
    setPages(prev => prev.map(p => p.id === pageId ? { ...p, folderId } : p));
    if (folderId) {
      setExpandedFolders(prev => prev.includes(folderId) ? prev : [...prev, folderId]);
    }
  }, []);

  const deletePage = useCallback((id: string) => {
    // Calculate next active page BEFORE updating state to ensure smooth transition
    if (activePageId === id) {
      const currentIndex = pages.findIndex(p => p.id === id);
      const remainingPages = pages.filter(p => p.id !== id);
      
      if (remainingPages.length > 0) {
        // Try to stay at the same index, or go to the last one if we were at the end
        const nextIndex = Math.min(currentIndex, remainingPages.length - 1);
        setActivePageId(remainingPages[nextIndex].id);
      } else {
        setActivePageId('');
      }
    }
    
    setPages(prev => prev.filter(p => p.id !== id));
  }, [activePageId, pages]);

  const updatePage = useCallback((id: string, updates: Partial<NotePage>) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p));
  }, []);

  // Pinning feature
  const pinPage = useCallback((id: string, isPinned: boolean) => {
     setPages(prev => prev.map(p => p.id === id ? { ...p, isPinned: isPinned } : p));
  }, []);

  const activePage = pages.find(p => p.id === activePageId);

  return {
    folders,
    pages,
    activePage,
    activePageId,
    setActivePageId,
    expandedFolders,
    addFolder,
    deleteFolder,
    renameFolder,
    updateFolder,
    toggleFolder,
    addPage,
    deletePage,
    updatePage,
    movePage,
    pinPage
  };
};
