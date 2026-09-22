"use client";

import { useEffect, useState } from "react";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

type Filter = "all" | "active" | "completed";

const STORAGE_KEY = "todos";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [input, setInput] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let stored: Todo[] = [];
    try {
      stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    } catch {
      stored = [];
    }
    setTodos(stored);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos, loaded]);

  function addTodo(text: string) {
    setTodos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text, completed: false },
    ]);
  }

  function toggleTodo(id: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  function deleteTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function editTodo(id: string, text: string) {
    const trimmed = text.trim();
    setTodos((prev) =>
      trimmed
        ? prev.map((t) => (t.id === id ? { ...t, text: trimmed } : t))
        : prev.filter((t) => t.id !== id)
    );
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.completed));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    addTodo(text);
    setInput("");
  }

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <div className="app">
      <h1>TODO</h1>

      <form className="input-row" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="やることを入力…"
          autoComplete="off"
          maxLength={200}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">追加</button>
      </form>

      <div className="filters">
        {(
          [
            { key: "all", label: "すべて" },
            { key: "active", label: "未完了" },
            { key: "completed", label: "完了済み" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            className={"filter-btn" + (filter === key ? " active" : "")}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="todo-list">
        {filtered.length === 0 && (
          <li className="empty-state">
            {todos.length === 0 ? "TODOはありません" : "該当する項目はありません"}
          </li>
        )}
        {filtered.map((todo) => (
          <li
            key={todo.id}
            className={"todo-item" + (todo.completed ? " completed" : "")}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span
              className="label"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => editTodo(todo.id, e.currentTarget.textContent ?? "")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
            >
              {todo.text}
            </span>
            <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="footer">
        <span>{remaining} 件残り</span>
        <button onClick={clearCompleted}>完了済みを削除</button>
      </div>
    </div>
  );
}
