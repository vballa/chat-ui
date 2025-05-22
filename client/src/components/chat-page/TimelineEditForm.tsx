// TimelineEditForm.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  useTheme,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import { useThemeContext } from "./ThemeContext";

interface TimelineItem {
  "Process Step": string;
  Owner: string;
  "Due Date": Date | string;
  "Actual Close Date": Date | string;
  Status: string;
  list_index?: number;
}

interface FormData {
  deal_id: string;
  timeline_data_dict_list: TimelineItem[];
  address_from_rpa_doc: string;
  rpa_version: string;
}

interface TimelineEditFormProps {
  initialData: FormData;
  open: boolean;
  onClose: () => void;
  onSubmit: (markdown: string, raw_data: string) => void;
}

const TimelineEditForm: React.FC<TimelineEditFormProps> = ({
  initialData,
  open,
  onClose,
  onSubmit,
}) => {
  const theme = useTheme();
  const { mode } = useThemeContext();
  const [formData, setFormData] = useState<FormData>({
    deal_id: "",
    timeline_data_dict_list: [],
    address_from_rpa_doc: "",
    rpa_version: "",
  });

  // Initialize form data with proper structure
  useEffect(() => {
    if (initialData) {
      const processedTimelineData =
        initialData.timeline_data_dict_list?.map((item) => {
          return {
            ...item,
            "Due Date":
              typeof item["Due Date"] === "string"
                ? item["Due Date"]
                : item["Due Date"] instanceof Date
                  ? item["Due Date"]
                  : new Date(item["Due Date"]),
            "Actual Close Date":
              typeof item["Actual Close Date"] === "string"
                ? item["Actual Close Date"]
                : item["Actual Close Date"] instanceof Date
                  ? item["Actual Close Date"]
                  : new Date(item["Actual Close Date"]),
          };
        }) || [];

      setFormData({
        deal_id: initialData.deal_id || "",
        timeline_data_dict_list: processedTimelineData,
        address_from_rpa_doc: initialData.address_from_rpa_doc || "",
        rpa_version: initialData.rpa_version || "",
      });
    } else {
      setFormData({
        deal_id: "",
        timeline_data_dict_list: [],
        address_from_rpa_doc: "",
        rpa_version: "",
      });
    }
  }, [initialData]);

  const handleTextChange = (
    index: number,
    key: keyof TimelineItem,
    value: string
  ) => {
    const newTimelineData = [...formData.timeline_data_dict_list];
    (newTimelineData[index][key] as string | number | Date | undefined) = value;
    setFormData({
      ...formData,
      timeline_data_dict_list: newTimelineData,
    });
  };

  const handleDateChange = (
    index: number,
    key: "Due Date" | "Actual Close Date",
    date: Date | null
  ) => {
    if (date) {
      const newTimelineData = [...formData.timeline_data_dict_list];
      newTimelineData[index][key] = date;
      setFormData({
        ...formData,
        timeline_data_dict_list: newTimelineData,
      });
    }
  };

  const handleStatusChange = (index: number, status: string) => {
    const newTimelineData = [...formData.timeline_data_dict_list];
    newTimelineData[index]["Status"] = status;
    setFormData({
      ...formData,
      timeline_data_dict_list: newTimelineData,
    });
  };

  const addTimelineItem = () => {
    setFormData({
      ...formData,
      timeline_data_dict_list: [
        ...formData.timeline_data_dict_list,
        {
          "Process Step": "",
          Owner: "",
          "Due Date": new Date(),
          "Actual Close Date": new Date(),
          Status: "pending",
        },
      ],
    });
  };

  const removeTimelineItem = (index: number) => {
    const newTimelineData = [...formData.timeline_data_dict_list];
    newTimelineData.splice(index, 1);
    setFormData({
      ...formData,
      timeline_data_dict_list: newTimelineData,
    });
  };

  const generateMarkdownTable = (data: TimelineItem[]) => {
    let markdown = "# Project Timeline\n\n";

    markdown +=
      "| Process Step | Owner | Due Date | Actual Close Date | Status |\n";
    markdown += "| --- | --- | --- | --- | --- |\n";

    data.forEach((item) => {
      const dueDate =
        typeof item["Due Date"] === "string"
          ? item["Due Date"]
          : format(item["Due Date"] as Date, "yyyy-MM-dd");

      const actualCloseDate =
        typeof item["Actual Close Date"] === "string"
          ? item["Actual Close Date"]
          : format(item["Actual Close Date"] as Date, "yyyy-MM-dd");

      markdown += `| ${item["Process Step"]} | ${item["Owner"]} | ${dueDate} | ${actualCloseDate} | ${item["Status"]} |\n`;
    });

    return markdown;
  };

  const handleSubmit = () => {
    const markdownTable = generateMarkdownTable(
      formData.timeline_data_dict_list
    );
    console.log("Final JSON data:", JSON.stringify(formData, null, 2));
    onSubmit(
      markdownTable,
      "@@@TIMELINE@@@" + JSON.stringify(formData, null, 2)
    );
    onClose();
  };

  const parseDate = (dateField: Date | string): Date | null => {
    if (dateField instanceof Date) {
      return dateField;
    } else if (
      typeof dateField === "string" &&
      dateField &&
      dateField !== "__"
    ) {
      try {
        return new Date(dateField);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const statusOptions = ["pending", "in progress", "completed", "delayed"];
  const ownerOptions = ["Agent", "Title", "Lender", "Buyer", "Seller"];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          elevation: 5,
          sx: {
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <DialogTitle sx={{ backgroundColor: theme.palette.background.paper }}>
          <Typography
            variant="h5"
            component="div"
            fontWeight="bold"
            color="text.primary"
          >
            Edit Project Timeline
          </Typography>
        </DialogTitle>

        <DialogContent
          sx={{ backgroundColor: theme.palette.background.paper, pt: 3 }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Timeline Items
              </Typography>
            </Grid>

            {formData.timeline_data_dict_list.map((item, index) => (
              <React.Fragment key={index}>
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ mt: 2, fontWeight: "bold" }}
                  >
                    Item {index + 1}
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => removeTimelineItem(index)}
                      sx={{ ml: 2 }}
                    >
                      Remove
                    </Button>
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Process Step"
                    value={item["Process Step"]}
                    onChange={(e) =>
                      handleTextChange(index, "Process Step", e.target.value)
                    }
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: theme.palette.chat_input.text_box,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Owner</InputLabel>
                    <Select
                      value={item["Owner"]}
                      label="Owner"
                      onChange={(e) =>
                        handleTextChange(index, "Owner", e.target.value)
                      }
                      sx={{
                        backgroundColor: theme.palette.chat_input.text_box,
                      }}
                    >
                      {ownerOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="Due Date"
                    value={parseDate(item["Due Date"])}
                    onChange={(date) =>
                      handleDateChange(index, "Due Date", date)
                    }
                    sx={{
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: theme.palette.chat_input.text_box,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="Actual Close Date"
                    value={parseDate(item["Actual Close Date"])}
                    onChange={(date) =>
                      handleDateChange(index, "Actual Close Date", date)
                    }
                    sx={{
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: theme.palette.chat_input.text_box,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={item["Status"]}
                      label="Status"
                      onChange={(e) =>
                        handleStatusChange(index, e.target.value)
                      }
                      sx={{
                        backgroundColor: theme.palette.chat_input.text_box,
                      }}
                    >
                      {statusOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </React.Fragment>
            ))}

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={addTimelineItem}
                sx={{
                  color: theme.palette.text.primary,
                  borderColor: theme.palette.text.primary,
                }}
              >
                Add Timeline Item
              </Button>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{ px: 3, pb: 3, backgroundColor: theme.palette.background.paper }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            color="inherit"
            sx={{
              color: theme.palette.text.primary,
              borderColor: theme.palette.text.primary,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              backgroundColor: theme.palette.side_panel.primary_btn,
              "&:hover": {
                backgroundColor: theme.palette.side_panel.primary_btn_hover,
              },
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default TimelineEditForm;
