import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

export interface Todo {
  id: string;
  todo: string;
  isCompleted: boolean;
  createdAt: string;
}

const DB_PATH = path.join(process.cwd(), 'todos.json');

async function loadTodos(): Promise<Todo[]> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Initialize with dummy data if file doesn't exist or error
    const initialTodos: Todo[] = [
      {
        id: uuidv4(),
        todo: 'Example Todo 1',
        isCompleted: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        todo: 'Example Todo 2',
        isCompleted: true,
        createdAt: new Date().toISOString(),
      },
    ];
    await saveTodos(initialTodos);
    return initialTodos;
  }
}

// Save todos to the JSON file
async function saveTodos(newTodos: Todo[]): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(newTodos, null, 2));
}

// Get all todos
export async function getTodos(): Promise<Todo[]> {
  return loadTodos();
}

// Add a new todo
export async function addTodo(newTodo: Todo): Promise<void> {
  const currentTodos = await loadTodos();
  currentTodos.push(newTodo);
  await saveTodos(currentTodos);
}

// Update a todo
export async function updateTodo(
  id: string,
  updates: Partial<Todo>
): Promise<boolean> {
  const currentTodos = await loadTodos();
  const index = currentTodos.findIndex(t => t.id === id);
  if (index === -1) return false;
  currentTodos[index] = { ...currentTodos[index], ...updates };
  await saveTodos(currentTodos);
  return true;
}

// Delete a todo
export async function deleteTodo(id: string): Promise<boolean> {
  const currentTodos = await loadTodos();
  const initialLength = currentTodos.length;
  const newTodos = currentTodos.filter(t => t.id !== id);
  if (newTodos.length === initialLength) return false;
  await saveTodos(newTodos);
  return true;
}
