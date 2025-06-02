import { db } from "./db";

type Message = { role: string; content: string };

type ChatData = {
  messages: Message[];
};

const listChats = async () => {
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

const getChat = async (chatId: string) => {
  const chat = await db.getChat(chatId);

  if (!chat) {
    console.error(`Chat with ID ${chatId} not found.`);
    return;
  }

  return {
    ...chat,
    data: JSON.parse(chat.data) as ChatData,
  };
};

const createChat = async (data: ChatData) => {
  const chatId = await db.insertChat(data);
  return chatId;
};

const deleteChat = async (chatId: string) => {
  const chat = await db.getChat(chatId);

  if (!chat) return;

  await db.deleteChat(chatId);
};

const addMessage = async (chatId: string, message: Message) => {
  const chat = await db.getChat(chatId);

  if (!chat) return;

  const { messages } = JSON.parse(chat.data) as ChatData;

  messages.push(message);

  await db.updateChat(chatId, { messages });

  return messages;
};

export const chats = {
  list: listChats,
  get: getChat,
  create: createChat,
  delete: deleteChat,
  addMessage: addMessage,
};
