import React, { useState } from "react";
import {
  Box,
  Modal,
  Typography,
  Grid,
  IconButton,
  TextField,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import Projects from "../assets/Projects.png";
import WorkspaceIconBlack from "../assets/WorkspaceIconBlack.png";
import { useDispatch, useSelector } from "react-redux";
import { editTaskAsync } from "../features/project/projectSlice";
import { toast } from "react-toastify";

const Attachments = styled("img")({
  width: "100px",
  height: "100px",
  marginRight: "10px",
});

const TaskModal = ({ open, handleClose, task }) => {
  const [currentComment, setCurrentComment] = useState("");
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.user?.loggedInUser);

  const handleUpdateTask = () => {
    if (currentComment.trim()) {
      const newComment = {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
        comment: currentComment,
      };

      const updatedComments = [...(task.comments || []), newComment];

      const updatedTaskDetails = {
        ...task,
        comments: updatedComments,
      };

      const data = {
        ...updatedTaskDetails,
      };

      const idObject = {
        taskId: task.id,
        id: task.projectID,
      };

      dispatch(editTaskAsync({ data, idObject }));
      setCurrentComment("");
    } else {
      toast.info("No changes to save.");
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "red";
      case "Medium":
        return "orange";
      case "Low":
        return "green";
      default:
        return "black";
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "17%",
          right: "2%",
          width: 400,
          bgcolor: "background.paper",
          border: "1px solid #ccc",
          boxShadow: 24,
          borderRadius: 2,
          pl: 4,
          pt: 4,
          pb: 4,
          pr: 8,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginRight: "10px",
              }}
            >
              <img
                src={WorkspaceIconBlack}
                alt="Workspace"
                style={{ width: 20, height: 20, marginRight: "5px" }}
              />
              <Typography variant="body2" color="textSecondary">
                {task?.workspace}
              </Typography>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src={Projects}
                alt="Project"
                style={{ width: 20, height: 20, marginRight: "5px" }}
              />
              <Typography variant="body2" color="textSecondary">
                {task?.project}
              </Typography>
            </div>
          </div>
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          <strong>{task?.name}</strong>
        </Typography>
        <Grid container spacing={1} sx={{ mb: 0 }}>
          <Grid item xs={6} sx={{ mb: 0 }}>
            <Typography variant="body1">
              <strong>Assignee</strong>
            </Typography>
          </Grid>
          <Grid item xs={6} sx={{ mb: 0 }}>
            <Typography variant="body1">
              {task?.assigneeUserID ? task?.assigneeUserID.email : ""}
            </Typography>
          </Grid>
          <Grid item xs={6} sx={{ mb: 0 }}>
            <Typography variant="body1">
              <strong>Due Date</strong>
            </Typography>
          </Grid>
          <Grid item xs={6} sx={{ mb: 0 }}>
            <Typography variant="body1">
              {task?.dueDate ? new Date(task.dueDate).toLocaleDateString() : ""}
            </Typography>
          </Grid>
          <Grid item xs={6} sx={{ mb: 1 }}>
            <Typography variant="body1">
              <strong>Priority</strong>
            </Typography>
          </Grid>
          <Grid item xs={6} sx={{ mb: 1 }}>
            <Typography
              variant="body1"
              sx={{ color: getPriorityColor(task?.priority) }}
            >
              {task?.priority}
            </Typography>
          </Grid>
        </Grid>
        {task?.attachments?.length > 0 ? (
          <>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Attachments ({task?.attachments?.length})</strong>
            </Typography>
            <Box sx={{ display: "flex", mb: 1 }}>
              {task.attachments.slice(0, 2).map((attachment) => (
                <Attachments
                  key={attachment._id}
                  src={attachment.docUrl}
                  alt={attachment.docName}
                />
              ))}
            </Box>
          </>
        ) : (
          <Grid container spacing={1} sx={{ mb: 0 }}>
            <Grid item xs={6} sx={{ mb: 0 }}>
              <Typography variant="body1">
                <strong>Attachments ({task?.attachments?.length})</strong>
              </Typography>
            </Grid>
          </Grid>
        )}
        <TextField
          fullWidth
          placeholder="Ask a question or post an update"
          multiline
          rows={2}
          variant="outlined"
          sx={{ bgcolor: "white", mt: 1 }}
          value={currentComment}
          onChange={(e) => setCurrentComment(e.target.value)}
        />
        {currentComment.trim() && (
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            fullWidth
            onClick={handleUpdateTask}
          >
            Post
          </Button>
        )}
      </Box>
    </Modal>
  );
};

export default TaskModal;
