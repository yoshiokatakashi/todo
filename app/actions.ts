"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { todos } from "@/db/schema";

export async function addTodo(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  await getDb().insert(todos).values({ text: trimmed });
  revalidatePath("/");
}

export async function toggleTodo(id: number, completed: boolean) {
  await getDb().update(todos).set({ completed }).where(eq(todos.id, id));
  revalidatePath("/");
}

export async function editTodo(id: number, text: string) {
  const trimmed = text.trim();
  if (trimmed) {
    await getDb().update(todos).set({ text: trimmed }).where(eq(todos.id, id));
  } else {
    await getDb().delete(todos).where(eq(todos.id, id));
  }
  revalidatePath("/");
}

export async function deleteTodo(id: number) {
  await getDb().delete(todos).where(eq(todos.id, id));
  revalidatePath("/");
}

export async function clearCompleted() {
  await getDb().delete(todos).where(eq(todos.completed, true));
  revalidatePath("/");
}
