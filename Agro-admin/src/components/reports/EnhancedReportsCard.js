import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import FlagIcon from "@mui/icons-material/Flag";
import ChatIcon from "@mui/icons-material/Chat";
import CommentIcon from "@mui/icons-material/Comment";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

// material-ui
import { useTheme } from "@mui/material/styles";
import {
  Grid,
  CardContent,
  Avatar,
  ListItemAvatar,
  List,
  ListItem,
  Typography,
  ListItemText,
  Divider,
  Button,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
} from "@mui/material";

// project imports
import MainCard from "../ui/cards/MainCard";
import SkeletonPopularCard from "../ui/skeletons/LinksCard";
import settings from "../../../package.json";
import { useSelector } from "react-redux";
import { 
  getReportComments, 
  getGroupChatReports,
  updateGroupChatReportStatus,
  adminDeleteGroupChatMessage 
} from "../../api/CommentsApi";

function EnhancedReportsCard() {
  // 1) Data
  const [commentReports, setCommentReports] = useState([]);
  const [groupChatReports, setGroupChatReports] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const theme = useTheme();
  const User = useSelector((state) => state.User.value);

  // 2) useEffects
  useEffect(() => {
    loadAllReports();
  }, []);

  // 3) Functions
  const loadAllReports = async () => {
    setLoading(true);
    setError("");
    
    try {
      const url = settings["appSettings :"].baseUrl;
      const token = User.Token;

      // Load both types of reports
      const [commentResponse, groupChatResponse] = await Promise.all([
        getReportComments(url, token),
        getGroupChatReports(url, token)
      ]);

      const commentData = await commentResponse.json();
      const groupChatData = await groupChatResponse.json();

      console.log("Comment Reports:", commentData);
      console.log("Group Chat Reports:", groupChatData);

      if (commentData?.resultCode === 0) {
        setCommentReports(commentData.data || []);
      }

      if (groupChatData?.resultCode === 0) {
        setGroupChatReports(groupChatData.response?.reports || []);
      }

    } catch (error) {
      console.error("Error loading reports:", error);
      setError("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'reviewed': return 'info';
      case 'resolved': return 'success';
      case 'dismissed': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Εκκρεμές';
      case 'reviewed': return 'Υπό εξέταση';
      case 'resolved': return 'Επιλύθηκε';
      case 'dismissed': return 'Απορρίφθηκε';
      default: return status;
    }
  };

  const handleUpdateStatus = async (reportId, newStatus) => {
    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const url = settings["appSettings :"].baseUrl;
      const token = User.Token;
      const adminId = User.id;

      const response = await updateGroupChatReportStatus(
        url, 
        reportId, 
        newStatus, 
        `Status updated to ${newStatus} by admin`, 
        adminId, 
        token
      );

      const data = await response.json();

      if (data?.resultCode === 0) {
        setSuccess(`Report status updated to ${getStatusText(newStatus)}`);
        await loadAllReports(); // Refresh the list
      } else {
        setError(data?.message || "Failed to update report status");
      }

    } catch (error) {
      console.error("Error updating report status:", error);
      setError("Failed to update report status. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMessage = (report) => {
    setSelectedReport(report);
    setDeleteDialogOpen(true);
    setDeleteReason("");
  };

  const confirmDeleteMessage = async () => {
    if (!selectedReport || !deleteReason.trim()) {
      setError("Please provide a reason for deletion");
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const url = settings["appSettings :"].baseUrl;
      const token = User.Token;
      const adminId = User.id;

      const response = await adminDeleteGroupChatMessage(
        url,
        selectedReport.messageId._id,
        adminId,
        deleteReason,
        token
      );

      const data = await response.json();

      if (data?.resultCode === 0) {
        setSuccess("Message deleted successfully");
        setDeleteDialogOpen(false);
        setSelectedReport(null);
        setDeleteReason("");
        await loadAllReports(); // Refresh the list
      } else {
        setError(data?.message || "Failed to delete message");
      }

    } catch (error) {
      console.error("Error deleting message:", error);
      setError("Failed to delete message. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const renderCommentReports = () => (
    <Box>
      {commentReports.length === 0 ? (
        <Typography variant="body2" color="textSecondary" textAlign="center" py={3}>
          Δεν υπάρχουν αναφορές σχολίων
        </Typography>
      ) : (
        commentReports.map((item, index) => (
          <Box key={index} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 2, p: 2, mb: 2 }}>
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                    <CommentIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1">
                        Συντάκτης: {item.author}
                      </Typography>
                      <Chip 
                        label="Σχόλιο άρθρου" 
                        color="primary" 
                        variant="outlined" 
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box mt={1}>
                      <Typography variant="body2" color="textPrimary">
                        <strong>Περιεχόμενο:</strong> {item.content}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Δημοσιεύτηκε: {new Date(item.publishedAt).toLocaleString('el-GR')}
                      </Typography>
                      {item.reportedReason && (
                        <Typography variant="caption" color="error" display="block">
                          <strong>Λόγος αναφοράς:</strong> {item.reportedReason}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            </List>
          </Box>
        ))
      )}
    </Box>
  );

  const renderGroupChatReports = () => (
    <Box>
      {groupChatReports.length === 0 ? (
        <Typography variant="body2" color="textSecondary" textAlign="center" py={3}>
          Δεν υπάρχουν αναφορές ομαδικής συνομιλίας
        </Typography>
      ) : (
        groupChatReports.map((report, index) => (
          <Box key={index} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 2, p: 2, mb: 2 }}>
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.error.main }}>
                    <ChatIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1">
                        {report.reportedUsername}
                      </Typography>
                      <Box display="flex" gap={1}>
                        <Chip 
                          label={getStatusText(report.status)} 
                          color={getStatusColor(report.status)}
                          size="small"
                        />
                        <Chip 
                          label="Ομαδική συνομιλία" 
                          color="secondary" 
                          variant="outlined" 
                          size="small"
                        />
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Box mt={1}>
                      <Typography variant="body2" color="textPrimary">
                        <strong>Μήνυμα:</strong> {report.reportedText}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <strong>Λόγος:</strong> {report.reason}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <strong>Αναφέρθηκε από:</strong> {report.reporterUsername}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Αναφορά: {new Date(report.reportDate).toLocaleString('el-GR')}
                      </Typography>
                      {report.reviewedAt && (
                        <Typography variant="caption" color="textSecondary" display="block">
                          Ελέγχθηκε: {new Date(report.reviewedAt).toLocaleString('el-GR')}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              
              {/* Action Buttons for Group Chat Reports */}
              <Box display="flex" gap={1} px={2} pb={1}>
                {report.status === 'pending' && (
                  <>
                    <Button
                      size="small"
                      variant="outlined"
                      color="info"
                      startIcon={<CheckIcon />}
                      onClick={() => handleUpdateStatus(report._id, 'reviewed')}
                      disabled={actionLoading}
                    >
                      Υπό εξέταση
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      startIcon={<CheckIcon />}
                      onClick={() => handleUpdateStatus(report._id, 'dismissed')}
                      disabled={actionLoading}
                    >
                      Απόρριψη
                    </Button>
                  </>
                )}
                
                {(report.status === 'pending' || report.status === 'reviewed') && (
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteMessage(report)}
                    disabled={actionLoading}
                  >
                    Διαγραφή μηνύματος
                  </Button>
                )}
              </Box>
            </List>
          </Box>
        ))
      )}
    </Box>
  );

  return (
    <>
      {loading ? (
        <SkeletonPopularCard />
      ) : (
        <MainCard content={false}>
          <CardContent>
            {/* Header */}
            <Grid container spacing={2} alignItems="center" mb={3}>
              <Grid item>
                <Avatar
                  variant="rounded"
                  sx={{
                    ...theme.typography.commonAvatar,
                    ...theme.typography.largeAvatar,
                    backgroundColor: theme.palette.primary.dark,
                    color: "#fff",
                  }}
                >
                  <FlagIcon />
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography color={theme.palette.primary.dark} variant="h4">
                  Διαχείριση Αναφορών
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  Αναφορές σχολίων άρθρων και ομαδικής συνομιλίας
                </Typography>
              </Grid>
            </Grid>

            {/* Alerts */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
                {success}
              </Alert>
            )}

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={currentTab} onChange={handleTabChange}>
                <Tab 
                  label={`Σχόλια άρθρων (${commentReports.length})`} 
                  icon={<CommentIcon />}
                  iconPosition="start"
                />
                <Tab 
                  label={`Ομαδική συνομιλία (${groupChatReports.length})`} 
                  icon={<ChatIcon />}
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            {/* Content */}
            {currentTab === 0 && renderCommentReports()}
            {currentTab === 1 && renderGroupChatReports()}
          </CardContent>
        </MainCard>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Επιβεβαίωση Διαγραφής Μηνύματος</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Θέλετε σίγουρα να διαγράψετε αυτό το μήνυμα;
          </Typography>
          {selectedReport && (
            <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mt: 2, mb: 2 }}>
              <Typography variant="body2">
                <strong>Μήνυμα:</strong> {selectedReport.reportedText}
              </Typography>
              <Typography variant="body2">
                <strong>Συντάκτης:</strong> {selectedReport.reportedUsername}
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Λόγος διαγραφής (υποχρεωτικό)"
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            margin="normal"
            placeholder="π.χ. Παραβίαση κανόνων κοινότητας, Ανάρμοστο περιεχόμενο..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Ακύρωση
          </Button>
          <Button 
            onClick={confirmDeleteMessage} 
            color="error" 
            variant="contained"
            disabled={actionLoading || !deleteReason.trim()}
            startIcon={actionLoading ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            Διαγραφή
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default EnhancedReportsCard;