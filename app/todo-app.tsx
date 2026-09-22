"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Todo } from "@/db/schema";
import { addTodo, clearCompleted, deleteTodo, editTodo, toggleTodo } from "./actions";

type Filter = "all" | "active" | "completed";

export default function TodoApp({ initialTodos }: { initialTodos: Todo[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [input, setInput] = useState("");
  const [, startTransition] = useTransition();

  function run(action: () => Promise<void>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    run(() => addTodo(text));
  }

  const filtered = initialTodos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const remaining = initialTodos.filter((t) => !t.completed).length;

  return (
    <div className="app">
      <h1>TODO</h1>

      <form className="input-row" onSubmit={handleSubmit}>
        <input
          id="todo-input"
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
            {initialTodos.length === 0
              ? "TODOはありません"
              : "該当する項目はありません"}
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
              onChange={() => run(() => toggleTodo(todo.id, !todo.completed))}
            />
            <span
              className="label"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                const text = e.currentTarget.textContent ?? "";
                run(() => editTodo(todo.id, text));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
            >
              {todo.text}
            </span>
            <button
              className="delete-btn"
              onClick={() => run(() => deleteTodo(todo.id))}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="footer">
        <span>{remaining} 件残り</span>
        <button
          id="clear-completed"
          onClick={() => run(() => clearCompleted())}
        >
          完了済みを削除
        </button>
      </div>
    </div>
  );
}
