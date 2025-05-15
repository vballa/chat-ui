"use client";
const baseURL = import.meta.env.VITE_API_URL;
import React, { useState, useEffect, useRef } from "react";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import { Message } from "./constants";
import ChatHistory from "./ChatHistory";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { Button, Box, useTheme, Typography, IconButton } from "@mui/material";
import { useThemeContext } from "./ThemeContext";
import { generateDashboardMessage, generateStatusTable } from "./constants";
import "../content/style.scss";

import SearchIcon from "@mui/icons-material/Search";
import CreateIcon from "@mui/icons-material/Create";
import ViewSidebarOutlinedIcon from "@mui/icons-material/ViewSidebarOutlined";
import LogoutIcon from "@mui/icons-material/Logout";

import RecentChats from "./RecentChat";
import { useNavigate } from "react-router-dom";
import instance from "../../config/instance";
import { useDispatch, useSelector } from "react-redux";
import { emptyUser } from "../../redux/user";

const ChatApp: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { toggleTheme, mode } = useThemeContext();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: Date.now().toString(),
      content:
        "Hello, this is Becky, your Real Estate AI Assistant. How can I help you today? I can start by creating a new deal, or you can ask me about existing deals or what needs to be done for today",
      isSentByUser: false,
      fileNames: [],
      avatarUrl: "/chat-gpt-icon.png",
    },
  ]);
  const [chatId, setChatId] = useState<string>(uuidv4());
  const [loader, setLoader] = React.useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [authToken, setAuthToken] = useState<string>();
  const chatWindowRef = useRef<HTMLDivElement>(null);

  const { user } = useSelector((state) => state);
  const [chatTitle, setChatTitle] = useState<string>("");

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTo({
        top: chatWindowRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSendMessage = async (message: string, files?: File[]) => {
    try {
      const formData = new FormData();
      const fileNames: string[] = [];

      // Append multiple files with the same field name
      files?.forEach((file) => {
        formData.append(`files`, file);
        fileNames.push(file.name);
      });

      // Adding files in message
      // message =
      //   message +
      //   (fileNames.length > 0
      //     ? "\nUploaded files are:\n - " + fileNames.join("\n - ")
      //     : "");

      message =
        message +
        (fileNames.length > 0
          ? "\nUploaded filename: " + fileNames.join("\n")
          : "");

      const newMessage: Message = {
        id: Date.now().toString(),
        content: message, // todo: Here you can remove @string for command text
        isSentByUser: true,
        fileUrls: files?.map((file) => URL.createObjectURL(file)),
        fileNames: files?.map((file) => file.name) || [],
      };

      setMessages((prev) => [...prev, newMessage]);

      formData.append("message", message);

      formData.append("chatId", chatId);
      formData.append("auth_token", authToken);

      setLoader(true); // Show loader when sending message

      const response = await fetch(`${baseURL}/api/chat`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "text/event-stream",
        },
        credentials: "include", // if you use cookies for auth
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let isDone = false;

      while (!isDone) {
        const { value, done } = await reader.read();
        isDone = done;

        if (value) {
          const jsonStrings = decoder
            .decode(value, { stream: true })
            // .replace(/\\/g, "\\\\")
            .split(/(?<=\})\s*(?=\{)/);

          jsonStrings.forEach((jsonString) => {
            try {
              const stream_data = JSON.parse(jsonString);

              console.log(stream_data);

              if (
                stream_data.node_name == "end_node" ||
                stream_data.node_name == "__interrupt__"
              ) {
                setLoader(false);
                if (stream_data.chat_title) {
                  setChatTitle(stream_data.chat_title);
                }
              }

              if (
                (stream_data.status === "node_stream" ||
                  stream_data.status === "custom_stream" ||
                  stream_data.status === "interrupted_msg") &&
                stream_data.type === "update" &&
                stream_data.msg != ""
              ) {
                setMessages((prev) => {
                  const updatedMessages = [...prev];
                  const lastMessage =
                    updatedMessages[updatedMessages.length - 1];
                  lastMessage.content = stream_data.msg;
                  return updatedMessages;
                });
              } else if (stream_data.type === "add" && stream_data.msg != "") {
                let message_ = stream_data.msg;
                // Check if the message is a special message starting with '@@@'
                if (stream_data.msg.startsWith("@@@")) {
                  const jsonString = stream_data.msg.slice(3); // Removing the '@@@' prefix
                  try {
                    const specialData = JSON.parse(jsonString);
                    if (specialData["template"] == "html_dashboard") {
                      message_ = generateDashboardMessage(
                        specialData["data"],
                        theme.palette.mode
                      );
                    } else if (specialData["template"] == "status_bar") {
                      message_ = generateStatusTable(specialData["data"]);
                    }
                  } catch (error) {
                    console.error("Error parsing special JSON:", error);
                  }
                }

                setMessages((prev) => [
                  ...prev,
                  {
                    id: uuidv4(),
                    content: message_,
                    isSentByUser: false,
                    fileNames: files?.map((f) => f.name) || [], // Update to array
                    avatarUrl: "/chat-gpt-icon.png",
                  },
                ]);
              }
            } catch (error) {
              console.error("Failed to parse JSON string:", jsonString, error);
            }
          });
        }
      }
    } catch (error) {
      console.error("Error from server side:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: "Error: Could not get a response from the server.",
          isSentByUser: false,
          fileNames: files?.map((f) => f.name) || [], // Update to array
          avatarUrl: "/chat-gpt-icon.png",
        },
      ]);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const response = await axios.get("api/chat/", {
        params: {
          chatId: chatId,
          authToken: authToken,
        },
      });

      const messages_data = response.data.data;

      if (messages_data) {
        setMessages([]);
        setChatId(chatId);

        messages_data.forEach((msg: { role: string; content: string }) => {
          // Check if the message is a special message starting with '@@@'
          let message_ = msg.content;
          if (msg.content.startsWith("@@@")) {
            const jsonString = msg.content.slice(3); // Removing the '@@@' prefix
            try {
              const specialData = JSON.parse(jsonString);
              if (specialData["template"] == "html_dashboard") {
                message_ = generateDashboardMessage(
                  specialData["data"],
                  theme.palette.mode
                );
              } else if (specialData["template"] == "status_bar") {
                message_ = generateStatusTable(specialData["data"]);
              }
            } catch (error) {
              console.error("Error parsing special JSON:", error);
            }
          }

          setMessages((prev) => [
            ...prev,
            {
              id: uuidv4(),
              content: message_,
              isSentByUser: msg.role == "human" ? true : false,
              fileNames: [],
              avatarUrl: msg.role == "human" ? "" : "/chat-gpt-icon.png",
            },
          ]);
        });
      } else {
        // couldn't load history msgs
        setMessages((prevMessages) => {
          return [prevMessages[0]];
        });
      }
    } catch (error) {
      console.error("Error retrieving messages:", error);
    }
  };

  const logOut = async () => {
    if (window.confirm("Do you want log out")) {
      let res: { data?: { status?: number } } | null = null;
      try {
        res = await instance.get(`/api/user/logout`);
      } catch (err) {
        alert(err);
      } finally {
        if (res?.data?.status === 200) {
          dispatch(emptyUser(null));
          navigate("/login");
        }
      }
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Box
        className="side-menu flex flex-col"
        sx={{ background: theme.palette.side_panel.bg }}
      >
        {/* New Chat */}

        {/* top menu buttons */}
        <Box className="chat-controls-wrapper" display="flex" gap={1}>
          <IconButton sx={{ transform: "rotate(180deg)" }}>
            <ViewSidebarOutlinedIcon />
          </IconButton>
          {/* <IconButton sx={{ marginLeft: "auto" }}>
            <SearchIcon />
          </IconButton>
          <IconButton
            onClick={() => {
              setChatId(uuidv4());
              setMessages((prevMessages) => {
                return [prevMessages[0]];
              });
            }}
          >
            <CreateIcon />
          </IconButton> */}
        </Box>

        {/* New chat button */}

        <Button
          onClick={() => {
            setChatId(uuidv4());
            setMessages((prevMessages) => {
              return [prevMessages[0]];
            });
          }}
          sx={{
            m: 2,
            color: "white",
            bgcolor: theme.palette.side_panel.primary_btn,
            border: "1px solid",
            borderColor: theme.palette.divider,
            borderRadius: 5,
            transition: "background-color 0.2s",
            "&:hover": {
              bgcolor: theme.palette.side_panel.primary_btn_hover,
            },
          }}
        >
          + New chat
        </Button>

        {/* Recent chats */}
        <Box
          display="flex"
          justifyContent="space-between"
          align-items="flex-start"
          flexDirection={"column"}
          p={2}
        >
          <Typography variant="h6" fontWeight={600}>
            Recent chats
          </Typography>
          <RecentChats loadMessages={loadMessages} chatTitle={chatTitle} />
        </Box>

        {/* <ChatHistory
          auth_token={authToken}
          activeChatId={chatId}
          loadMessages={loadMessages}
        /> */}

        <Button
          onClick={toggleTheme}
          sx={{
            m: 2,
            p: 1.5,
            color: theme.palette.text.primary,
            display: "flex",
            alignItems: "center",
            gap: 2,
            borderRadius: 1,
            transition: "background-color 0.2s",
            "&:hover": theme.palette.side_panel.bg,
            marginTop: "auto",
          }}
        >
          {mode === "light" ? (
            <>
              <DarkModeIcon /> Dark Mode
            </>
          ) : (
            <>
              <LightModeIcon /> Light Mode
            </>
          )}{" "}
        </Button>
      </Box>
      {/* Messages */}
      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        sx={{ bgcolor: theme.palette.chat_window.bg }}
      >
        <Box
          className="chat-window-container"
          display="flex"
          flexDirection="column"
          height="100vh"
        >
          <Box
            className={`btn ${mode === "light" ? "header white-shadow" : "header shadow"}`}
            // className="header"
            p={1}
            textAlign="center"
            borderBottom={1}
            borderColor="#8585851a"
            gap={2}
          >
            {mode === "light" ? (
              <img
                className="logo"
                src="/assets/png/airestacks-logo.png"
                alt="Logo"
              />
            ) : (
              <>
                <img
                  className="logo"
                  src="/assets/png/airestacks-logo-white.png"
                  alt="Logo"
                />
              </>
            )}
            <Typography variant="subtitle2" color="text.primary">
              {user["email"]}
            </Typography>

            <IconButton onClick={logOut}>
              <LogoutIcon />
            </IconButton>
          </Box>

          <Box
            flex={1}
            sx={{
              // padding: "2rem 16rem",
              overflowY: "auto",
              "&::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none", // IE and Edge
              scrollbarWidth: "none", // Firefox
            }}
            ref={chatWindowRef}
          >
            <ChatWindow messages={messages} loader={loader} />
          </Box>

          <Box flexShrink={0}>
            <ChatInput
              handleSendMessage={handleSendMessage}
              isLoading={loader}
            />
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default ChatApp;
