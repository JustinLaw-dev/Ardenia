'use client';

import { useState } from 'react';

export default function TaskPage() {
  const [task, setTask] = useState<string>(''); // task is a string
  const [tasks, setTasks] = useState<string[]>([]); // tasks is an array of strings
  // Function to handle adding a task
  const addTask = () => {
    if (task.trim()) {
      setTasks([...tasks, task]);
      setTask(''); // Clear input after adding
    }
  };

  // Function to handle deleting a task
  const deleteTask = (index: unknown) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
  };

  return (
    <div className="container">
      <h1>To-Do List</h1>
      <div className="input-container">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Enter a new task"
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      <ul className="task-list">
        {tasks.map((task, index) => (
          <li key={index}>
            {task}{' '}
            <button
              onClick={() => deleteTask(index)}
              className="text-destructive text-red-500"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
