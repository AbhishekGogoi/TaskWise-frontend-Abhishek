import React from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Edit as EditIcon, Close as CloseIcon } from "@mui/icons-material";
import { FaRobot } from "react-icons/fa";
import "./TaskCard.css";

const TaskCard = ({ task, onClose, onEdit }) => {
  return (
    <Card
      className="task-card"
      sx={{
        width: 280,
        borderRadius: 2,
      }}
    >
      <div className="task-header">
        <IconButton className="robot-icon">
          <FaRobot
            size={15}
            style={{
              backgroundColor: "#00c6ff",
              backgroundImage: "linear-gradient(120deg, #00c6ff, #8e71df)",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "10px",
              padding: "5px",
            }}
          />
        </IconButton>
        <div className="task-actions">
          <Tooltip title="Edit">
            <IconButton className="edit-icon" onClick={onEdit}>
              <EditIcon
                size={10}
                style={{
                  color: "#00c6ff",
                  fontWeight: "bold",
                  borderRadius: "10px",
                }}
              />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove">
            <IconButton className="close-icon" onClick={onClose}>
              <CloseIcon
                size={10}
                style={{
                  color: "#00c6ff",
                  fontWeight: "bold",
                  borderRadius: "10px",
                }}
              />
            </IconButton>
          </Tooltip>
        </div>
      </div>
      <div
        style={{
          overflow: "scroll",
          scrollbarWidth: "none", // For Firefox
          msOverflowStyle: "none", // For Internet Explorer and Edge
        }}
      >
        <style>
          {`
      .hide-scrollbar::-webkit-scrollbar {
        display: none; /* For Chrome, Safari, and Opera */
      }
    `}
        </style>
        <CardContent
          className="task-card-content hide-scrollbar"
          sx={{ mt: 6 }}
        >
          <Typography variant="h6" component="h3" gutterBottom>
            {task.title}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {task.description}
          </Typography>
        </CardContent>
      </div>

      <div className="task-footer">
        <Typography
          variant="body2"
          color="textSecondary"
          className="task-status"
        >
          {task.status}
        </Typography>
      </div>
    </Card>
  );
};

TaskCard.propTypes = {
  task: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default TaskCard;
