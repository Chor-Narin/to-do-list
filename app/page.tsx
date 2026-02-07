'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './lib/supabase';
import { Todo } from './lib/todos';

// interface Todo {
//   id: string;
//   todo: string;
//   isCompleted: boolean;
//   createdAt: string;
// }

type FilterType = 'all' | 'completed' | 'incomplete' | 'sort';

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [warning, setWarning] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  // Fetch todos list from API
  const fetchTodos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/todo');
      if (res.ok) {
        const data: Todo[] = await res.json();
        setTodos(data);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
      setWarning('Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
    const channel = supabase
      .channel('todo-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        () => fetchTodos()
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key == 'Escape') {
      e.preventDefault();
      setInput('');
      setWarning('');
      return;
    }

    if (e.key == 'Enter') {
      const trimmed = input.trim();
      if (!trimmed) {
        setWarning('Todo cannot be empty');
        return;
      }

      const duplicate = todos.find(
        t => t.todo.toLowerCase() === trimmed.toLowerCase() && t.id !== editId
      );
      if (duplicate) {
        setWarning('This todo already exists');
        return;
      }
      setWarning('');
      setLoading(true);

      try {
        if (editId) {
          await fetch(`/api/todo/${editId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ todo: trimmed }),
          });
          setEditId(null);
        } else {
          await fetch('/api/todo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              todo: trimmed,
            }),
          });
        }
        setInput('');
      } catch (error) {
        setWarning('Failed to save todo');
      } finally {
        await fetchTodos();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (loading) return;
    setLoading(true);
    try {
      await fetch(`/api/todo/${id}`, { method: 'DELETE' });
    } catch (error) {
      setWarning('Failed to delete todo');
    } finally {
      await fetchTodos();
    }
  };

  // Edit todo
  const handleEdit = (todo: Todo) => {
    if (loading) return;
    setInput(todo.todo);
    setEditId(todo.id);
  };

  // Toggle completion status
  const handleToggleComplete = async (todo: Todo) => {
    if (loading) return;
    setLoading(true);
    try {
      await fetch(`/api/todo/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !todo.isCompleted }),
      });
    } catch (error) {
      setWarning('Failed to update todo');
    } finally {
      await fetchTodos();
    }
  };

  // Filter todos
  const filteredTodos = todos
    // 1. Filter by Search Input
    .filter(t => {
      if (input) return t.todo.toLowerCase().includes(input.toLowerCase());
      return true;
    })
    // 2. Filter by Status (Completed/Incomplete)
    .filter(t => {
      if (filter === 'completed') return t.isCompleted;
      if (filter === 'incomplete') return !t.isCompleted;
      return true; // Keep all items for 'all' or 'sort' modes
    })
    // 3. Sort by Date (Only if 'sort' is active)
    .sort((a, b) => {
      if (filter === 'sort') {
        // Newest first: convert ISO strings to numeric timestamps
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      return 0; // Default order
    });

  return (
    <main className="min-h-screen bg-linear-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-4">📝 My Todo List</h1>

        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={editId ? 'Edit todo...' : 'Add or search todo...'}
          disabled={loading}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {/* Filter Buttons */}
        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={() => setFilter('sort')}
            className={`px-5 py-2 rounded-lg font-medium ${
              filter === 'sort' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}
          >
            Sort
          </button>

          <button
            onClick={() => setFilter('all')}
            disabled={loading}
            className={`px-5 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            All
          </button>

          <button
            onClick={() => setFilter('completed')}
            disabled={loading}
            className={`px-5 py-2 rounded-lg font-medium transition-all ${
              filter === 'completed'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Completed
          </button>

          <button
            onClick={() => setFilter('incomplete')}
            disabled={loading}
            className={`px-5 py-2 rounded-lg font-medium transition-all ${
              filter === 'incomplete'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Incomplete
          </button>
        </div>

        {warning && (
          <p className="text-sm text-red-500 mt-3 text-center">{warning}</p>
        )}

        <ul className="mt-6 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center py-12">
              <div className="border-4 border-blue-400 border-t-transparent rounded-full w-12 h-12 animate-spin mb-4"></div>
              <p className="text-gray-600">Loading your todos...</p>
            </div>
          ) : filteredTodos.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {input
                ? 'No results — press Enter to create it!'
                : filter === 'all'
                  ? 'No todos yet! Add one above'
                  : filter === 'completed'
                    ? 'No completed todos '
                    : 'No incomplete todos yet!'}
            </p>
          ) : (
            filteredTodos.map(todo => (
              <li
                key={todo.id}
                className={`group relative flex items-center p-4 rounded-lg transition-all ${
                  todo.isCompleted
                    ? 'bg-gray-100 opacity-75'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <span
                  className={`flex-1 overflow-hidden text-ellipsis whitespace-nowrap pr-2 font-medium ${
                    todo.isCompleted
                      ? 'line-through text-red-700'
                      : 'text-green-700'
                  }`}
                >
                  {typeof todo.todo === 'string' ? todo.todo : ''}
                </span>

                <div className="absolute right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleToggleComplete(todo)}
                    disabled={loading}
                    className={`text-xs px-3 py-1 rounded  transition font-bold disabled:opacity-50 disabled:cursor-not-allowed ${
                      todo.isCompleted
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {todo.isCompleted
                      ? 'Mark as Incomplete'
                      : 'Mark as Complete'}
                  </button>

                  <button
                    onClick={() => handleEdit(todo)}
                    disabled={loading}
                    className={`text-xs px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed ${
                      todo.isCompleted ? 'hidden' : 'inline-block'
                    }`}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(todo.id)}
                    disabled={loading}
                    className="text-xs px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </main>
  );
}
