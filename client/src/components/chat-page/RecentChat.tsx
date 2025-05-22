import React, { useEffect } from "react";
import { useState } from "react";
import instance from "../../config/instance";

interface Props {
  loadMessages: (chatId: string) => void;
  chatTitle: string;
}

export default function RecentChats({ loadMessages, chatTitle }: Props) {
  const [chats, setChats] = useState<{ title: string; id: string }[]>([]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await instance.get(`/api/chat/history`);
        setChats(response.data.data);
      } catch (error) {
        console.error("Error retrieving chat history:", error);
      }
    };

    fetchChatHistory();
  }, [chatTitle]);
  // }, [auth_token, activeChatId]);

  return (
    <div className="recent-chat-wrapper w-auto py-3 overflow-y-auto">
      <ul className="space-y-2 ">
        {chats.map((chat, index) => (
          <li
            onClick={() => loadMessages(chat.id)}
            key={index}
            style={{ width: "100%" }}
            className="p-1 rounded hover:bg-[#8585851a] cursor-pointer"
          >
            {chat.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
