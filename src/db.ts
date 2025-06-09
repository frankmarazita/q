import os from "node:os";
import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import { randomUUID } from "crypto";
import { CONFIG_FOLDER } from "./services/config";

const DATA_PATH = path.join(CONFIG_FOLDER, "data.db");

export interface Chat {
  id: string;
  data: string; // JSON string
  created_at: string;
  updated_at: string;
}

export class DatabaseManager {
  private db: sqlite3.Database;

  constructor() {
    const dir = path.dirname(DATA_PATH);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new sqlite3.Database(DATA_PATH);
    this.init();
  }

  private init(): void {
    // Enable WAL mode for better concurrency
    this.db.run("PRAGMA journal_mode = WAL");

    this.createTables();
  }

  private createTables(): void {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
  }

  insertChat(data: object, id?: string): Promise<string> {
    const recordId = id || randomUUID();
    return new Promise((resolve, reject) => {
      this.db.run(
        "INSERT INTO chats (id, data) VALUES (?, ?)",
        [recordId, JSON.stringify(data)],
        function (err) {
          if (err) reject(err);
          else resolve(recordId);
        }
      );
    });
  }

  getChat(id: string): Promise<Chat | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get("SELECT * FROM chats WHERE id = ?", [id], (err, row) => {
        if (err) reject(err);
        else resolve(row as Chat | undefined);
      });
    });
  }

  getAllChats(): Promise<Chat[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT * FROM chats ORDER BY created_at ASC",
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows as Chat[]);
        }
      );
    });
  }

  updateChat(id: string, data: object): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        "UPDATE chats SET data = ?, updated_at = datetime('now') WHERE id = ?",
        [JSON.stringify(data), id],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  deleteChat(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run("DELETE FROM chats WHERE id = ?", [id], function (err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export const db = new DatabaseManager();
