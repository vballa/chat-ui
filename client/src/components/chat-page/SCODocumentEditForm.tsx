// SCODocumentEditForm.tsx
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
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useThemeContext } from "./ThemeContext";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, addDays } from "date-fns";

interface DateField {
  date: string;
  days?: number;
}

interface SCODocumentData {
  "SCO Number": number;
  "Sellers name(s)": string;
  "Seller signed date": DateField;
  "Buyers name(s)": string;
  "Buyer signed date": string | DateField;
  Address: string;
  "Offer price": string;
  "Close of escrow date": number | string | DateField;
  "Offer expiry date": DateField;
  "Earnest deposit": string;
  "Loan amount": string;
  "Loan percentage": string;
  "Down payment": string;
  "Loan contingency due": string | DateField;
  "Appraisal contingency due": string | DateField;
  "Property contingency due": string | DateField;
  "Seller disclosure due": string | DateField;
  "Title report due": string | DateField;
  "Seller docs due": string | DateField;
  list_index?: number;
}

interface SCODocumentEditFormProps {
  initialData: SCODocumentData;
  open: boolean;
  onClose: () => void;
  onSubmit: (markdown: string, raw_data: string) => void;
}

const SCODocumentEditForm: React.FC<SCODocumentEditFormProps> = ({
  initialData,
  open,
  onClose,
  onSubmit,
}) => {
  const theme = useTheme();
  const { mode } = useThemeContext();
  const [formData, setFormData] = useState<SCODocumentData>(initialData);

  // Initialize form data with proper structure
  useEffect(() => {
    const processedData = { ...initialData };

    // Convert string fields to proper date objects if needed
    const dateFields = [
      "Seller signed date",
      "Buyer signed date",
      "Close of escrow date",
      "Offer expiry date",
      "Loan contingency due",
      "Appraisal contingency due",
      "Property contingency due",
      "Seller disclosure due",
      "Title report due",
      "Seller docs due",
    ];

    dateFields.forEach((field) => {
      if (
        typeof processedData[field] === "string" &&
        processedData[field] !== "-"
      ) {
        processedData[field] = { date: processedData[field] as string };
      }
    });

    setFormData(processedData);
  }, [initialData]);

  const handleTextChange = (key: keyof SCODocumentData, value: string) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };

  const handleDateChange = (key: keyof SCODocumentData, date: Date | null) => {
    if (date) {
      const dateString = format(date, "yyyy-MM-dd");
      let newValue: DateField;

      if (
        typeof formData[key] === "object" &&
        "days" in (formData[key] as DateField)
      ) {
        newValue = {
          date: dateString,
          days: (formData[key] as DateField).days,
        };
      } else {
        newValue = { date: dateString };
      }

      setFormData({
        ...formData,
        [key]: newValue,
      });
    }
  };

  const handleDaysChange = (key: keyof SCODocumentData, days: string) => {
    const daysNumber = parseInt(days);
    if (!isNaN(daysNumber)) {
      const currentDate = new Date();
      const newDate = addDays(currentDate, daysNumber);

      setFormData({
        ...formData,
        [key]: {
          days: daysNumber,
          date: format(newDate, "yyyy-MM-dd"),
        },
      });
    }
  };

  const generateMarkdownTable = (data: SCODocumentData) => {
    let markdown = "# Seller Counter Offer (SCO) Summary\n\n";

    markdown += "| Item | Details |\n";
    markdown += "| --- | --- |\n";
    markdown += `| SCO Number | ${data["SCO Number"] || ""} |\n`;
    markdown += `| Address | ${data.Address || ""} |\n`;
    markdown += `| Offer Price | ${data["Offer price"] || ""} |\n`;
    markdown += `| Seller(s) | ${data["Sellers name(s)"] || ""} |\n`;
    markdown += `| Seller Signed Date | ${data["Seller signed date"]?.date || ""} |\n`;
    markdown += `| Buyer(s) | ${data["Buyers name(s)"] || ""} |\n`;

    // Handle Buyer signed date which could be a string or DateField
    let buyerSignedDate = "";
    if (
      typeof data["Buyer signed date"] === "object" &&
      data["Buyer signed date"]?.date
    ) {
      buyerSignedDate = data["Buyer signed date"].date;
    } else if (typeof data["Buyer signed date"] === "string") {
      buyerSignedDate = data["Buyer signed date"];
    }
    markdown += `| Buyer Signed Date | ${buyerSignedDate} |\n`;

    // Handle Close of escrow date which could be a number, string, or DateField
    let closeOfEscrowDate = "";
    if (
      typeof data["Close of escrow date"] === "object" &&
      data["Close of escrow date"]?.date
    ) {
      closeOfEscrowDate = data["Close of escrow date"].date;
    } else if (
      typeof data["Close of escrow date"] === "string" ||
      typeof data["Close of escrow date"] === "number"
    ) {
      closeOfEscrowDate = String(data["Close of escrow date"]);
    }
    markdown += `| Close of Escrow Date | ${closeOfEscrowDate} |\n`;

    // For fields with both date and days
    const formatDateAndDays = (field) => {
      if (!field) return "";
      if (typeof field === "string") return field;
      let result = field.date || "";
      if (field.days) result += ` (${field.days} days)`;
      return result;
    };

    markdown += `| Offer Expiry Date | ${formatDateAndDays(data["Offer expiry date"])} |\n`;
    markdown += `| Earnest Deposit | ${data["Earnest deposit"] || ""} |\n`;
    markdown += `| Loan Amount | ${data["Loan amount"] || ""} ${data["Loan percentage"] ? `(${data["Loan percentage"]})` : ""} |\n`;
    markdown += `| Down Payment | ${data["Down payment"] || ""} |\n`;
    markdown += `| Loan Contingency Due | ${formatDateAndDays(data["Loan contingency due"])} |\n`;
    markdown += `| Appraisal Contingency | ${formatDateAndDays(data["Appraisal contingency due"])} |\n`;
    markdown += `| Property Contingency Due | ${formatDateAndDays(data["Property contingency due"])} |\n`;
    markdown += `| Seller Disclosure Due | ${formatDateAndDays(data["Seller disclosure due"])} |\n`;
    markdown += `| Title Report Due | ${formatDateAndDays(data["Title report due"])} |\n`;
    markdown += `| Seller Docs Due | ${formatDateAndDays(data["Seller docs due"])} |\n`;

    return markdown;
  };

  const handleSubmit = () => {
    const markdownTable = generateMarkdownTable(formData);
    console.log("Final JSON data:", JSON.stringify(formData, null, 2));
    onSubmit(markdownTable, "@@@SCO@@@" + JSON.stringify(formData, null, 2));
    onClose();
  };

  const parseDate = (dateField: DateField | string | number): Date | null => {
    if (typeof dateField === "object" && dateField?.date) {
      return new Date(dateField.date);
    } else if (
      typeof dateField === "string" &&
      dateField &&
      dateField !== "-"
    ) {
      return new Date(dateField);
    }
    return null;
  };

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
            Edit Seller Counter Offer (SCO) Document
          </Typography>
        </DialogTitle>

        <DialogContent
          sx={{ backgroundColor: theme.palette.background.paper, pt: 3 }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="SCO Number"
                value={formData["SCO Number"]}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setFormData({
                    ...formData,
                    "SCO Number": isNaN(value) ? 0 : value,
                  });
                }}
                type="number"
                fullWidth
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: theme.palette.chat_input.text_box,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={9}>
              <TextField
                label="Address"
                value={formData["Address"]}
                onChange={(e) => handleTextChange("Address", e.target.value)}
                fullWidth
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: theme.palette.chat_input.text_box,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Transaction Parties
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Sellers Name(s)"
                value={formData["Sellers name(s)"]}
                onChange={(e) =>
                  handleTextChange("Sellers name(s)", e.target.value)
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
              <TextField
                label="Buyers Name(s)"
                value={formData["Buyers name(s)"]}
                onChange={(e) =>
                  handleTextChange("Buyers name(s)", e.target.value)
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

            <Grid item xs={12} md={3}>
              <DatePicker
                label="Seller Signed Date"
                value={parseDate(formData["Seller signed date"])}
                onChange={(date) =>
                  handleDateChange("Seller signed date", date)
                }
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: theme.palette.chat_input.text_box,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <DatePicker
                label="Buyer Signed Date"
                value={parseDate(formData["Buyer signed date"] as any)}
                onChange={(date) => handleDateChange("Buyer signed date", date)}
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: theme.palette.chat_input.text_box,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Financial Details
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="Offer Price"
                value={formData["Offer price"]}
                onChange={(e) =>
                  handleTextChange("Offer price", e.target.value)
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

            <Grid item xs={12} md={3}>
              <TextField
                label="Earnest Deposit"
                value={formData["Earnest deposit"]}
                onChange={(e) =>
                  handleTextChange("Earnest deposit", e.target.value)
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

            <Grid item xs={12} md={3}>
              <TextField
                label="Loan Amount"
                value={formData["Loan amount"]}
                onChange={(e) =>
                  handleTextChange("Loan amount", e.target.value)
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

            <Grid item xs={12} md={3}>
              <TextField
                label="Loan Percentage"
                value={formData["Loan percentage"]}
                onChange={(e) =>
                  handleTextChange("Loan percentage", e.target.value)
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

            <Grid item xs={12} md={3}>
              <TextField
                label="Down Payment"
                value={formData["Down payment"]}
                onChange={(e) =>
                  handleTextChange("Down payment", e.target.value)
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

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Key Dates
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <DatePicker
                label="Close of Escrow Date"
                value={parseDate(formData["Close of escrow date"])}
                onChange={(date) =>
                  handleDateChange("Close of escrow date", date)
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
              <TextField
                label="Offer Expiry Days"
                value={formData["Offer expiry date"]?.days || ""}
                onChange={(e) =>
                  handleDaysChange("Offer expiry date", e.target.value)
                }
                type="number"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">days</InputAdornment>
                  ),
                }}
                fullWidth
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: theme.palette.chat_input.text_box,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <DatePicker
                label="Offer Expiry Date"
                value={parseDate(formData["Offer expiry date"])}
                onChange={(date) => handleDateChange("Offer expiry date", date)}
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: theme.palette.chat_input.text_box,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Contingencies
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Loan Contingency Due"
                value={
                  typeof formData["Loan contingency due"] === "object"
                    ? formData["Loan contingency due"].date
                    : formData["Loan contingency due"]
                }
                onChange={(e) =>
                  handleTextChange("Loan contingency due", e.target.value)
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
              <TextField
                label="Appraisal Contingency Due"
                value={
                  typeof formData["Appraisal contingency due"] === "object"
                    ? formData["Appraisal contingency due"].date
                    : formData["Appraisal contingency due"]
                }
                onChange={(e) =>
                  handleTextChange("Appraisal contingency due", e.target.value)
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
              <TextField
                label="Property Contingency Due"
                value={
                  typeof formData["Property contingency due"] === "object"
                    ? formData["Property contingency due"].date
                    : formData["Property contingency due"]
                }
                onChange={(e) =>
                  handleTextChange("Property contingency due", e.target.value)
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
              <TextField
                label="Seller Disclosure Due"
                value={
                  typeof formData["Seller disclosure due"] === "object"
                    ? formData["Seller disclosure due"].date
                    : formData["Seller disclosure due"]
                }
                onChange={(e) =>
                  handleTextChange("Seller disclosure due", e.target.value)
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
              <TextField
                label="Title Report Due"
                value={
                  typeof formData["Title report due"] === "object"
                    ? formData["Title report due"].date
                    : formData["Title report due"]
                }
                onChange={(e) =>
                  handleTextChange("Title report due", e.target.value)
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
              <TextField
                label="Seller Docs Due"
                value={
                  typeof formData["Seller docs due"] === "object"
                    ? formData["Seller docs due"].date
                    : formData["Seller docs due"]
                }
                onChange={(e) =>
                  handleTextChange("Seller docs due", e.target.value)
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

export default SCODocumentEditForm;
