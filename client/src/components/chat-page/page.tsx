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
import BugReportButton from "./BugReportButton";
import UserPermissionForm from "./UserPermissionForm";

import RPADocumentEditForm from "./RPADocumentEditForm";
import SCODocumentEditForm from "./SCODocumentEditForm";
import TimelineEditForm from "./TimelineEditForm";


const initialFormData = [
  {
    role: "owner",
    email: "owner@email.com",
    permission: ["agent", "buyer", "admin", "seller", "guest"],
  },
  {
    role: "buyer",
    email: "buyer@email.com",
    permission: ["agent", "buyer", "admin", "seller", "guest"],
  },
  {
    role: "seller",
    email: "seller@email.com",
    permission: ["agent", "buyer", "admin", "seller", "guest"],
  },
  {
    role: "guest",
    email: "guest@email.com",
    permission: ["agent", "buyer", "admin", "seller", "guest"],
  },
];

const ChatApp: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { toggleTheme, mode } = useThemeContext();
  const [messages, setMessages] = useState<Message[]>([
    // {
    //   id: Date.now().toString(),
    //   content:
    //     "Hello, this is Becky, your Real Estate AI Assistant. How can I help you today? I can start by creating a new deal, or you can ask me about existing deals or what needs to be done for today",
    //   isSentByUser: false,
    //   fileNames: [],
    //   avatarUrl: "/chat-gpt-icon.png",
    // },
  ]);
  const [chatId, setChatId] = useState<string>(uuidv4());
  const [loader, setLoader] = React.useState(false);

  const [rpaFormOpen, setRPAFormOpen] = useState(false);
  const [scoFormOpen, setSCOFormOpen] = useState(false);
  const [timelineFormOpen, setTimelineFormOpen] = useState(false);
  const [timelineFormData, setTimelineFormData] = useState();


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [authToken, setAuthToken] = useState<string>();
  const chatWindowRef = useRef<HTMLDivElement>(null);

  const { user } = useSelector((state) => state);
  const [chatTitle, setChatTitle] = useState<string>("");
  const [rpaFormData, setRpaFormData] = useState();
  const [scoFormData, setScoFormData] = useState();

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTo({
        top: chatWindowRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const hasSentInitialMessage = useRef(false);

  useEffect(() => {
    // This is to triger as chat window loaded, it can use to send first welcome message by server if no old msg found in the conversation.
    if (!hasSentInitialMessage.current && messages.length === 0) {
      handleSendMessage("__load_chat_window__"); //'__new_chat__';
      hasSentInitialMessage.current = true;
    }
  }, []);

  const handleSendMessage = async (
    message: string,
    files?: File[],
    sentByUser = true,
    raw_data = ""
  ) => {

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

      console.log(message);

      // This message: is sent by user when click on sent button
      const newMessage: Message = {
        id: uuidv4(),
        content: message, // send json msg to server instead of md if that available, from form outputs
        isSentByUser: sentByUser, //default true
        fileUrls: files?.map((file) => URL.createObjectURL(file)),
        fileNames: files?.map((file) => file.name) || [],
      };

      setMessages((prev) => [...prev, newMessage]);

      formData.append("message", raw_data != "" ? raw_data : message);
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

      let stream_msgs = "";

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

              if (stream_data.status == "msg_stream") {
                // here handle the streaming message

                if (stream_msgs == "") {
                  // First add then below append only
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: uuidv4(),
                      content: stream_msgs,
                      isSentByUser: false,
                      fileNames: files?.map((f) => f.name) || [], // Update to array
                      avatarUrl: "/chat-gpt-icon.png",
                    },
                  ]);
                }

                stream_msgs += stream_data.msg;

                setMessages((prev) => {
                  const updatedMessages = [...prev];
                  const lastMessage =
                    updatedMessages[updatedMessages.length - 1];
                  lastMessage.content = stream_msgs;
                  return updatedMessages;
                });

                return;
              } else {
                //reset the variable if not stream_msg
                stream_msgs = "";
              }

              console.log(stream_data);

              // For end node return/finish
              if (
                stream_data.status === "node_stream" &&
                stream_data.node_name == "end_node"
              ) {
                setLoader(false);
                if (stream_data.chat_title) {
                  setChatTitle(stream_data.chat_title);
                }
                return;
              }

              //For interrupted msg return/finish here
              if (stream_data.status === "interrupted_msg") {
                setMessages((prev) => [
                  ...prev,
                  {
                    id: uuidv4(),
                    content: stream_data.msg,
                    isSentByUser: false,
                    fileNames: files?.map((f) => f.name) || [], // Update to array
                    avatarUrl: "/chat-gpt-icon.png",
                  },
                ]);

                setLoader(false);
                return;
              }

              if (
                (stream_data.status === "node_stream" ||
                  stream_data.status === "custom_stream" ||
                  stream_data.status === "interrupted_msg") &&
                stream_data.type === "update" &&
                stream_data.msg != ""
              ) {
                // For overriting prev msg
                setMessages((prev) => {
                  const updatedMessages = [...prev];
                  const lastMessage =
                    updatedMessages[updatedMessages.length - 1];
                  lastMessage.content = stream_data.msg;
                  return updatedMessages;
                });
              } else if (stream_data.type === "add" && stream_data.msg != "") {
                let message_ = stream_data.msg;
                // Check if the message is a special message containing '@@@'

                if (stream_data.msg.startsWith("@@@")) {
                  // Try to extract template type and JSON data
                  const match = stream_data.msg.match(/@@@(\w+)@@@(.*)/);

                  if (match) {
                    const templateType = match[1]; // This captures the word between the first and second @@@
                    const jsonString = match[2]; // This captures everything after the second @@@

                    try {
                      const specialData = JSON.parse(jsonString);

                      if (templateType === "RPA") {
                        setRpaFormData(specialData);
                        setRPAFormOpen(true);
                      } else if (templateType === "SCO") {
                        setScoFormData(specialData);
                        setSCOFormOpen(true);
                      } else if (templateType === "TIMELINE") {
                        setTimelineFormData(specialData);
                        setTimelineFormOpen(true);
                      } else if (templateType === "html_dashboard") {
                        message_ = generateDashboardMessage(
                          specialData,
                          theme.palette.mode
                        );
                      } else if (templateType === "status_bar") {
                        message_ = generateStatusTable(specialData);
                      }
                      // You can add more template types as needed
                    } catch (error) {
                      console.error(
                        `Error parsing ${templateType} JSON:`,
                        error
                      );
                    }
                  }
                } else {
                  // Not to show anything if it starts with @@@ (for form data)
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
              }
            } catch (error) {
              console.error("Failed to parse JSON string:", jsonString, error);
            }
          });
        }
      }
    } catch (error) {
      console.error("Error from server side_:", error);
      setLoader(false);
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          content: "Error: Could not get a response from the server.",
          isSentByUser: false,
          fileNames: files?.map((f) => f.name) || [], // Update to array
          avatarUrl: "/chat-gpt-icon.png",
        },
      ]);
    }
  };

  const loadMessages = async (chatId: string) => {
    //Load messages when user click on history list item;
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
      {/* Custom dialog form for data input */}
      <UserPermissionForm
        initialData={initialFormData}
        handleSendMessage={handleSendMessage}
        open={permissionFormOpen}
        onClose={() => setPermissionFormOpen(false)}
        // theme={theme}
      />

      {rpaFormData && (
        <RPADocumentEditForm
          initialData={rpaFormData}
          open={rpaFormOpen}
          onClose={() => setRPAFormOpen(false)}
          onSubmit={(message, raw_data) =>
            handleSendMessage(message, undefined, false, raw_data)
          }
        />
      )}

      {scoFormData && (
        <SCODocumentEditForm
          initialData={scoFormData}
          open={scoFormOpen}
          onClose={() => setSCOFormOpen(false)}
          onSubmit={(message, raw_data) =>
            handleSendMessage(message, undefined, false, raw_data)
          }
        />
      )}

      {timelineFormData && (
        <TimelineEditForm
          initialData={timelineFormData}
          open={timelineFormOpen}
          onClose={() => setTimelineFormOpen(false)}
          onSubmit={(message, raw_data) =>
            handleSendMessage(message, undefined, false, raw_data)
          }
        />
      )}


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

            //// keep last msg
            // setMessages((prevMessages) => {
            //   return [prevMessages[0]];
            // });

            // remove all messages on new chat click
            setMessages([]);
            handleSendMessage("__new_chat__"); //send trigger command to server to receive welcome message from server
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

        <BugReportButton
          chat_id={chatId}
          chat_messages={messages}
          apiEndpoint={`${baseURL}/api/bug-report`}
        />
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
