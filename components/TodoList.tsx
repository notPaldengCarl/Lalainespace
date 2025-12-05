
import React, { useState } from 'react';
import { Plus, Check, Trash2, ListTodo, Folder } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { TodoItem } from '../types';
import { DEFAULT_PROJECTS } from '../constants';

interface TodoListProps {
  todos: TodoItem[];
  onAdd: (text: string, projectId: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TodoList: React.FC<TodoListProps> = ({ todos, onAdd, onToggle, onDelete }) => {
  const [inputText, setInputText] = useState('');
  const [activeProject, setActiveProject] = useState('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      // If 'all' is selected, default to 'uncategorized', otherwise use active project
      const targetProject = activeProject === 'all' ? 'uncategorized' : activeProject;
      onAdd(inputText, targetProject);
      setInputText('');
    }
  };

  const confirmDelete = (id: string) => {
    const Swal = (window as any).Swal;
    if (Swal) {
      Swal.fire({
        title: 'Delete Task?',
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      }).then((result: any) => {
        if (result.isConfirmed) {
          onDelete(id);
        }
      });
    } else {
      if (confirm('Delete this task?')) onDelete(id);
    }
  };

  const filteredTodos = activeProject === 'all' 
    ? todos 
    : todos.filter(t => t.projectId === activeProject);

  const getProjectInfo = (id: string) => DEFAULT_PROJECTS.find(p => p.id === id);

  return (
    <Card title="To-Do List" icon={<ListTodo size={24} />} className="h-full min-h-[400px]">
      <div className="flex flex-col h-full">
        
        {/* Project Tabs - Horizontal Scrollable on Mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar" role="tablist" aria-label="Project filters">
          <button
            onClick={() => setActiveProject('all')}
            aria-label="Show all tasks"
            aria-pressed={activeProject === 'all'}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeProject === 'all' 
                ? 'bg-coffee text-white' 
                : 'bg-white text-mocha hover:bg-white/80'
            }`}
          >
            All Tasks
          </button>
          {DEFAULT_PROJECTS.map(proj => (
            <button
              key={proj.id}
              onClick={() => setActiveProject(proj.id)}
              aria-label={`Show ${proj.name} tasks`}
              aria-pressed={activeProject === proj.id}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeProject === proj.id 
                  ? 'bg-accent text-white' 
                  : 'bg-white text-mocha hover:bg-white/80'
              }`}
            >
              {proj.name}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={activeProject === 'all' ? "Add uncategorized task..." : `Add to ${DEFAULT_PROJECTS.find(p=>p.id === activeProject)?.name}...`}
            aria-label="New task description"
            className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-transparent focus:border-accentLight focus:ring-2 focus:ring-accentLight/20 outline-none transition-all text-sm md:text-base"
          />
          <Button type="submit" size="md" disabled={!inputText.trim()} aria-label="Add task">
            <Plus size={20} />
          </Button>
        </form>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {filteredTodos.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-mocha/60 italic text-sm">
              <p>No tasks in {activeProject === 'all' ? 'view' : 'this project'}.</p>
            </div>
          )}
          {filteredTodos.map((todo) => {
            const project = getProjectInfo(todo.projectId);
            return (
              <div
                key={todo.id}
                className={`group flex items-start p-3 rounded-xl bg-white/60 hover:bg-white transition-all duration-200 border border-transparent hover:border-accentLight/20 ${todo.completed ? 'opacity-60' : ''}`}
              >
                <button
                  onClick={() => onToggle(todo.id)}
                  aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
                  className={`flex-shrink-0 w-5 h-5 mt-1 rounded-md border-2 flex items-center justify-center transition-colors mr-3 ${todo.completed ? 'bg-accent border-accent' : 'border-accentLight hover:border-accent'}`}
                >
                  {todo.completed && <Check size={12} className="text-white" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm md:text-base text-coffee break-words ${todo.completed ? 'line-through text-mocha' : ''}`}>
                    {todo.text}
                  </p>
                  {/* Project Tag */}
                  {project && activeProject === 'all' && (
                    <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide font-semibold ${project.color}`}>
                      {project.name}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => confirmDelete(todo.id)}
                  aria-label="Delete task"
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-mocha hover:text-red-500 hover:bg-red-50 rounded-lg transition-all ml-2"
                  title="Delete task"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
