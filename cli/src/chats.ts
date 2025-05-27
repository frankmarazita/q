import { DatabaseManager } from "./db";

const listChats = async (db: DatabaseManager) => {
  const chats = await db.getAllChats();

  if (chats.length === 0) {
    console.log("No chats found.");
    return;
  }

  const formattedChats = chats.map((chat) => {
    const m = JSON.parse(chat.data).messages;

    return {
      id: chat.id,
      message: m[1].content.slice(0, 20) + "...",
      created_at: chat.created_at,
      updated_at: chat.updated_at,
      chat_length: m.length,
    };
  });

  console.table(formattedChats, [
    "id",
    "message",
    "created_at",
    "updated_at",
    "chat_length",
  ]);
};

const deleteChat = async (db: DatabaseManager, chatId: string) => {
  const chat = await db.getChat(chatId);

  if (!chat) {
    console.error(`Chat with ID ${chatId} not found.`);
    return;
  }

  await db.deleteChat(chatId);
  console.log(`Chat with ID ${chatId} deleted.`);
};

export const chats = {
  list: listChats,
  delete: deleteChat,
};
