// RPADocumentEditForm.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Paper,
  Typography,
  Box,
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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: "bold",
  backgroundColor: theme.palette.md_table.header_bg,
  color: theme.palette.md_table.header_text,
}));

interface DateField {
  date: string;
  days?: number;
}

interface DocumentData {
  "Doc preparation date": DateField;
  "Parcel number": string;
  "Sellers name(s)": string;
  "Seller signed date": DateField;
  "Seller agent details": string;
  "Seller Agent Sign Date": DateField;
  "Buyers name(s)": string;
  "Buyer signed date": DateField;
  "Buyer agent details": string;
  "Buyer Agent Sign Date": DateField;
  Address: string;
  City: string;
  "Zip code": string;
  "Offer price": string;
  "Close of escrow date": DateField;
  "Offer expiry date": DateField;
  "Earnest deposit": string;
  "Loan amount": string;
  "Loan percentage": string;
  "Down payment": string;
  "Loan contingency due": DateField;
  "Appraisal contingency due": string;
  "Property contingency due": DateField;
  "Seller disclosure due": DateField;
  "Title report due": DateField;
  "Seller docs due": DateField;
}

interface DocumentEditFormProps {
  initialData: DocumentData;
  open: boolean;
  onClose: () => void;
  onSubmit: (markdown: string, raw_data: string) => void;
}

const DocumentEditForm: React.FC<DocumentEditFormProps> = ({
  initialData,
  open,
  onClose,
  onSubmit,
}) => {
  const theme = useTheme();
  const { mode } = useThemeContext();
  const [formData, setFormData] = useState<DocumentData>(initialData);

  const handleTextChange = (key: keyof DocumentData, value: string) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };

  const handleDateChange = (key: keyof DocumentData, date: Date | null) => {
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

  const handleDaysChange = (key: keyof DocumentData, days: string) => {
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

  const generateMarkdownTable_ = (data: DocumentData) => {
    let markdown = "# Real Estate Transaction Details\n\n";

    markdown += "## Property Information\n";
    markdown += `- **Address:** ${data["Address"]}\n`;
    markdown += `- **City:** ${data["City"]}\n`;
    markdown += `- **Zip Code:** ${data["Zip code"]}\n`;
    markdown += `- **Parcel Number:** ${data["Parcel number"]}\n\n`;

    markdown += "## Transaction Parties\n";
    markdown += `- **Sellers:** ${data["Sellers name(s)"]}\n`;
    markdown += `- **Buyers:** ${data["Buyers name(s)"]}\n`;
    markdown += `- **Seller Agent:** ${data["Seller agent details"]}\n`;
    markdown += `- **Buyer Agent:** ${data["Buyer agent details"]}\n\n`;

    markdown += "## Financial Details\n";
    markdown += `- **Offer Price:** ${data["Offer price"]}\n`;
    markdown += `- **Earnest Deposit:** ${data["Earnest deposit"]}\n`;
    markdown += `- **Loan Amount:** ${data["Loan amount"]} (${data["Loan percentage"]})\n`;
    markdown += `- **Down Payment:** ${data["Down payment"]}\n\n`;

    markdown += "## Key Dates\n";
    markdown += `- **Document Preparation:** ${data["Doc preparation date"].date}\n`;
    markdown += `- **Seller Signed:** ${data["Seller signed date"].date}\n`;
    markdown += `- **Buyer Signed:** ${data["Buyer signed date"].date}\n`;
    markdown += `- **Close of Escrow:** ${data["Close of escrow date"].date}\n`;
    markdown += `- **Offer Expiry:** ${data["Offer expiry date"].date} (${data["Offer expiry date"].days} days)\n\n`;

    markdown += "## Contingencies\n";
    markdown += `- **Loan Contingency Due:** ${data["Loan contingency due"].date} (${data["Loan contingency due"].days} days)\n`;
    markdown += `- **Appraisal Contingency:** ${data["Appraisal contingency due"]}\n`;
    markdown += `- **Property Contingency Due:** ${data["Property contingency due"].date} (${data["Property contingency due"].days} days)\n`;
    markdown += `- **Seller Disclosure Due:** ${data["Seller disclosure due"].date} (${data["Seller disclosure due"].days} days)\n`;
    markdown += `- **Title Report Due:** ${data["Title report due"].date} (${data["Title report due"].days} days)\n`;
    markdown += `- **Seller Docs Due:** ${data["Seller docs due"].date} (${data["Seller docs due"].days} days)\n`;

    return markdown;
  };

  // Generate markdown table from real estate transaction data
  const generateMarkdownTable__ = (data) => {
    let markdown = "# Real Estate Transaction Summary\n\n";

    // Property Information
    markdown += "## Property Information\n";
    markdown += "| Property | Details |\n";
    markdown += "| --- | --- |\n";
    markdown += `| Address | ${data.Address} |\n`;
    markdown += `| City | ${data.City} |\n`;
    markdown += `| Zip Code | ${data["Zip code"]} |\n`;
    markdown += `| Parcel Number | ${data["Parcel number"]} |\n`;

    // Financial Details
    markdown += "\n## Financial Details\n";
    markdown += "| Item | Amount |\n";
    markdown += "| --- | --- |\n";
    markdown += `| Offer Price | ${data["Offer price"]} |\n`;
    markdown += `| Earnest Deposit | ${data["Earnest deposit"]} |\n`;
    markdown += `| Loan Amount | ${data["Loan amount"]} (${data["Loan percentage"]}) |\n`;
    markdown += `| Down Payment | ${data["Down payment"]} |\n`;

    // Parties Information
    markdown += "\n## Parties Information\n";
    markdown += "| Role | Name | Signed Date |\n";
    markdown += "| --- | --- | --- |\n";
    markdown += `| Seller(s) | ${data["Sellers name(s)"]} | ${data["Seller signed date"].date} |\n`;
    markdown += `| Seller's Agent | ${data["Seller agent details"]} | ${data["Seller Agent Sign Date"].date} |\n`;
    markdown += `| Buyer(s) | ${data["Buyers name(s)"]} | ${data["Buyer signed date"].date} |\n`;
    markdown += `| Buyer's Agent | ${data["Buyer agent details"]} | ${data["Buyer Agent Sign Date"].date} |\n`;

    // Important Dates
    markdown += "\n## Important Dates\n";
    markdown += "| Event | Date |\n";
    markdown += "| --- | --- |\n";
    markdown += `| Document Preparation | ${data["Doc preparation date"].date} |\n`;
    markdown += `| Close of Escrow | ${data["Close of escrow date"].date} |\n`;
    markdown += `| Offer Expiry | ${data["Offer expiry date"].date} (${data["Offer expiry date"].days} days) |\n`;

    // Contingencies
    markdown += "\n## Contingencies and Due Dates\n";
    markdown += "| Contingency | Due Date |\n";
    markdown += "| --- | --- |\n";
    markdown += `| Loan | ${data["Loan contingency due"].date} (${data["Loan contingency due"].days} days) |\n`;
    markdown += `| Appraisal | ${data["Appraisal contingency due"]} |\n`;
    markdown += `| Property | ${data["Property contingency due"].date} (${data["Property contingency due"].days} days) |\n`;
    markdown += `| Seller Disclosure | ${data["Seller disclosure due"].date} (${data["Seller disclosure due"].days} days) |\n`;
    markdown += `| Title Report | ${data["Title report due"].date} (${data["Title report due"].days} days) |\n`;
    markdown += `| Seller Documents | ${data["Seller docs due"].date} (${data["Seller docs due"].days} days) |\n`;

    return markdown;
  };

  // Generate markdown table from real estate transaction data
  const generateMarkdownTable = (data) => {
    let markdown = "# Real Estate Transaction Summary\n\n";

    markdown += "| Item | Details |\n";
    markdown += "| --- | --- |\n";
    markdown += `| Address | ${data.Address || ""} |\n`;
    markdown += `| City | ${data.City || ""} |\n`;
    markdown += `| Zip Code | ${data["Zip code"] || ""} |\n`;
    markdown += `| Parcel Number | ${data["Parcel number"] || ""} |\n`;
    markdown += `| Offer Price | ${data["Offer price"] || ""} |\n`;
    markdown += `| Earnest Deposit | ${data["Earnest deposit"] || ""} |\n`;
    markdown += `| Loan Amount | ${data["Loan amount"] || ""} ${data["Loan percentage"] ? `(${data["Loan percentage"]})` : ""} |\n`;
    markdown += `| Down Payment | ${data["Down payment"] || ""} |\n`;
    markdown += `| Seller(s) | ${data["Sellers name(s)"] || ""} |\n`;
    markdown += `| Seller Signed Date | ${data["Seller signed date"]?.date || ""} |\n`;
    markdown += `| Seller's Agent | ${data["Seller agent details"] || ""} |\n`;
    markdown += `| Seller Agent Sign Date | ${data["Seller Agent Sign Date"]?.date || ""} |\n`;
    markdown += `| Buyer(s) | ${data["Buyers name(s)"] || ""} |\n`;
    markdown += `| Buyer Signed Date | ${data["Buyer signed date"]?.date || ""} |\n`;
    markdown += `| Buyer's Agent | ${data["Buyer agent details"] || ""} |\n`;
    markdown += `| Buyer Agent Sign Date | ${data["Buyer Agent Sign Date"]?.date || ""} |\n`;
    markdown += `| Document Preparation Date | ${data["Doc preparation date"]?.date || ""} |\n`;
    markdown += `| Close of Escrow Date | ${data["Close of escrow date"]?.date || ""} |\n`;

    // For fields with both date and days
    const formatDateAndDays = (field) => {
      if (!field) return "";
      let result = field.date || "";
      if (field.days) result += ` (${field.days} days)`;
      return result;
    };

    markdown += `| Offer Expiry Date | ${formatDateAndDays(data["Offer expiry date"])} |\n`;
    markdown += `| Loan Contingency Due | ${formatDateAndDays(data["Loan contingency due"])} |\n`;
    markdown += `| Appraisal Contingency | ${formatDateAndDays(data["Appraisal contingency due"]) || "No appraisal contigency"} |\n`;
    markdown += `| Property Contingency Due | ${formatDateAndDays(data["Property contingency due"])} |\n`;
    markdown += `| Seller Disclosure Due | ${formatDateAndDays(data["Seller disclosure due"])} |\n`;
    markdown += `| Title Report Due | ${formatDateAndDays(data["Title report due"])} |\n`;
    markdown += `| Seller Docs Due | ${formatDateAndDays(data["Seller docs due"])} |\n`;

    return markdown;
  };

  const handleSubmit = () => {
    const markdownTable = generateMarkdownTable(formData);
    console.log("Final JSON data:", JSON.stringify(formData, null, 2));
    onSubmit(markdownTable, "@@@RPA@@@" + JSON.stringify(formData, null, 2));

    onClose();
  };

  const parseDate = (dateField: DateField | string): Date | null => {
    if (typeof dateField === "object" && dateField.date) {
      return new Date(dateField.date);
    } else if (typeof dateField === "string" && dateField) {
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
            Edit Real Estate Transaction Document
          </Typography>
        </DialogTitle>

        <DialogContent
          sx={{ backgroundColor: theme.palette.background.paper, pt: 3 }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Property Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
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

            <Grid item xs={12} md={3}>
              <TextField
                label="City"
                value={formData["City"]}
                onChange={(e) => handleTextChange("City", e.target.value)}
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
                label="Zip Code"
                value={formData["Zip code"]}
                onChange={(e) => handleTextChange("Zip code", e.target.value)}
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
                label="Parcel Number"
                value={formData["Parcel number"]}
                onChange={(e) =>
                  handleTextChange("Parcel number", e.target.value)
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

            <Grid item xs={12} md={5}>
              <TextField
                label="Seller Agent Details"
                value={formData["Seller agent details"]}
                onChange={(e) =>
                  handleTextChange("Seller agent details", e.target.value)
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

            <Grid item xs={12} md={2}>
              <DatePicker
                label="Seller Agent Sign Date"
                value={parseDate(formData["Seller Agent Sign Date"])}
                onChange={(date) =>
                  handleDateChange("Seller Agent Sign Date", date)
                }
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: theme.palette.chat_input.text_box,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={5}>
              <TextField
                label="Buyer Agent Details"
                value={formData["Buyer agent details"]}
                onChange={(e) =>
                  handleTextChange("Buyer agent details", e.target.value)
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

            <Grid item xs={12} md={2}>
              <DatePicker
                label="Buyer Agent Sign Date"
                value={parseDate(formData["Buyer Agent Sign Date"])}
                onChange={(date) =>
                  handleDateChange("Buyer Agent Sign Date", date)
                }
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
                label="Doc Preparation Date"
                value={parseDate(formData["Doc preparation date"])}
                onChange={(date) =>
                  handleDateChange("Doc preparation date", date)
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
                value={parseDate(formData["Buyer signed date"])}
                onChange={(date) => handleDateChange("Buyer signed date", date)}
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
                value={formData["Offer expiry date"].days || ""}
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

            <Grid item xs={12} md={3}>
              <TextField
                label="Loan Contingency Days"
                value={formData["Loan contingency due"].days || ""}
                onChange={(e) =>
                  handleDaysChange("Loan contingency due", e.target.value)
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

            <Grid item xs={12} md={3}>
              <DatePicker
                label="Loan Contingency Date"
                value={parseDate(formData["Loan contingency due"])}
                onChange={(date) =>
                  handleDateChange("Loan contingency due", date)
                }
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: theme.palette.chat_input.text_box,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Appraisal Contingency Due"
                value={formData["Appraisal contingency due"]}
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

            <Grid item xs={12} md={3}>
              <TextField
                label="Property Contingency Days"
                value={formData["Property contingency due"].days || ""}
                onChange={(e) =>
                  handleDaysChange("Property contingency due", e.target.value)
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

            <Grid item xs={12} md={3}>
              <DatePicker
                label="Property Contingency Date"
                value={parseDate(formData["Property contingency due"])}
                onChange={(date) =>
                  handleDateChange("Property contingency due", date)
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
              <TextField
                label="Seller Disclosure Days"
                value={formData["Seller disclosure due"].days || ""}
                onChange={(e) =>
                  handleDaysChange("Seller disclosure due", e.target.value)
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

            <Grid item xs={12} md={3}>
              <DatePicker
                label="Seller Disclosure Date"
                value={parseDate(formData["Seller disclosure due"])}
                onChange={(date) =>
                  handleDateChange("Seller disclosure due", date)
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
              <TextField
                label="Title Report Days"
                value={formData["Title report due"].days || ""}
                onChange={(e) =>
                  handleDaysChange("Title report due", e.target.value)
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

            <Grid item xs={12} md={3}>
              <DatePicker
                label="Title Report Date"
                value={parseDate(formData["Title report due"])}
                onChange={(date) => handleDateChange("Title report due", date)}
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: theme.palette.chat_input.text_box,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="Seller Docs Days"
                value={formData["Seller docs due"].days || ""}
                onChange={(e) =>
                  handleDaysChange("Seller docs due", e.target.value)
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

            <Grid item xs={12} md={3}>
              <DatePicker
                label="Seller Docs Date"
                value={parseDate(formData["Seller docs due"])}
                onChange={(date) => handleDateChange("Seller docs due", date)}
                sx={{
                  width: "100%",
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

export default DocumentEditForm;
