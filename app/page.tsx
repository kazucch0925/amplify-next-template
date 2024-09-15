"use client";

import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import DashboardItem from "./components/DashboardItem"

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  function listTodos() {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  useEffect(() => {
    listTodos();
  }, []);

  function createTodo() {
    client.models.Todo.create({
      content: window.prompt("Todo content"),
    });
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <h1>ダッシュボード</h1>
          <div className="dashboard-items">
            <DashboardItem title="Wiki" icon="wiki-icon.png" disabled /*link="/wiki" *//>
            <DashboardItem title="議事録" icon="minutes-icon.png" link="/minutes" />
            //<DashboardItem title="アップロード" icon="upload-icon.png" link="/upload" /*onClick={handleUploadButtonClick}*/ />
            <DashboardItem title="設定" icon="settings-icon.png" disabled />
          </div>
          <button onClick={createTodo}>+ new</button>
          <ul>
            {todos.map((todo) => (
              <li
              onClick={() => deleteTodo(todo.id)}
              key={todo.id}>{todo.content}</li>
            ))}
          </ul>
          <button onClick={signOut}>Sign out</button>
        </main>
      )}
    </Authenticator>
  )
}
