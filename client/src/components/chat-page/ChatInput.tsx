import React, { useState, useRef } from "react";
import {
  TextField,
  IconButton,
  Chip,
  useTheme,
  Box,
  Button,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LinearScaleIcon from "@mui/icons-material/LinearScale";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import CancelIcon from "@mui/icons-material/Cancel";

interface ChatInputProps {
  handleSendMessage: (message: string, files?: File[]) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  handleSendMessage,
  isLoading,
}) => {
  const [message, setMessage] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();

  const handleSend = () => {
    if (message.trim() || selectedFiles.length > 0) {
      handleSendMessage(message, selectedFiles);
      setMessage("");
      setSelectedFiles([]);
      resetFileInput();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleFileRemove = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Box
      p={4}
      borderTop={1}
      borderColor="#0000000d"
      display={"flex"}
      flexDirection="row-reverse"
      alignItems="center"
      gap={"16px"}
    >
      <Box position="relative" width={"100%"}>
        <TextField
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          fullWidth
          variant="outlined"
          sx={{
            width: "100%",
            "& .MuiOutlinedInput-root": {
              bgcolor: theme.palette.chat_input.text_box,
              color: theme.palette.text.primary,
              borderRadius: "12px",
              "& fieldset": { borderColor: "transparent" },
              "&:hover fieldset": { borderColor: "transparent" },
              "&.Mui-focused fieldset": { borderColor: "transparent" },
            },
            "& .MuiOutlinedInput-input": {
              paddingRight: "120px",
            },
          }}
          InputProps={{
            endAdornment: (
              <Box
                position="absolute"
                right={4}
                top="50%"
                sx={{
                  transform: "translateY(-50%)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {selectedFiles.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name}
                    onDelete={() => handleFileRemove(index)}
                    deleteIcon={
                      <CancelIcon
                        sx={{ color: theme.palette.text.secondary }}
                      />
                    }
                    size="small"
                    sx={{
                      mr: 1,
                      bgcolor: "transparent",
                      color: theme.palette.text.primary,
                    }}
                  />
                ))}
                <label htmlFor="file-input">
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                  <IconButton
                    component="span"
                    sx={{
                      color: theme.palette.text.secondary,
                      "&:hover": { color: theme.palette.text.primary },
                    }}
                    title="Attach File"
                  >
                    <AttachFileIcon />
                  </IconButton>
                </label>
                <IconButton
                  onClick={handleSend}
                  disabled={isLoading}
                  sx={{
                    color: theme.palette.text.secondary,
                    "&:hover": { color: theme.palette.text.primary },
                    "&.Mui-disabled": {
                      color: theme.palette.action.disabled,
                    },
                  }}
                  title="Send Message"
                >
                  <SendIcon />
                </IconButton>
              </Box>
            ),
          }}
        />
      </Box>

      {/* Two beautiful buttons below the input text box */}
      <Box
        className="buttons-wrapper"
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap={2}
      >
        <IconButton
          title="Show Home List"
          className="button"
          onClick={() => handleSendMessage("@Show Home List")}
        >
          <HomeIcon />
        </IconButton>

        <IconButton
          title="Show Dashboard"
          className="button"
          onClick={() => handleSendMessage("@Show Dashboard")}
        >
          <DashboardIcon />
        </IconButton>

        <IconButton
          title="Show Status Bar"
          className="button"
          onClick={() => handleSendMessage("@Show Status Bar")}
        >
          <LinearScaleIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatInput;
