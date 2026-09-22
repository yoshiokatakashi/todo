import { getDb } from "@/db";
import { todos } from "@/db/schema";
import TodoApp from "./todo-app";

export const dynamic = "force-dynamic";

export default async function Home() {
  const initialTodos = await getDb().select().from(todos).orderBy(todos.id);
  return <TodoApp initialTodos={initialTodos} />;
}
