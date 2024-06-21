import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import { styled, useTheme } from "@mui/material/styles";
import TaskCard from "./TaskCard";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import "./TaskList.css";
import {
  Button,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { createProjectAIAsync } from "../../../features/project/projectSlice";
import { getImageUrlAsync } from "../../../features/workspace/workspaceSlice";
import { useLocation } from "react-router-dom";

const CustomBox = styled(Box)(({ theme }) => ({
  height: "calc(100vh - 350px)",
  overflowY: "auto",
  padding: theme.spacing(2),
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#888",
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "#555",
  },
  "-ms-overflow-style": "none",
  "scrollbar-width": "thin",
  "scrollbar-color": "#888 #e0e0e0",
}));

function TaskList() {
  const theme = useTheme();
  const [currentPage, setCurrentPage] = useState(0);
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();
  const aiData = useSelector((state) => state?.ai?.aiData);
  const user = useSelector((state) => state?.user?.loggedInUser);
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { workspaceID } = location.state || {};
  const [editTask, setEditTask] = useState(null);
  const [editedTaskDetails, setEditedTaskDetails] = useState({
    title: "",
    description: "",
  });
  useEffect(() => {
    if (aiData) {
      setTasks(aiData.tasks);
    }
    console.log(aiData?.tasks, "aiData");
  }, [aiData]);

  const tasksPerRow = 3;
  const rowsPerPage = 1;
  const tasksPerPage = tasksPerRow * rowsPerPage;
  const totalPages = Math.ceil(tasks?.length / tasksPerPage);
  const dispatch = useDispatch();
  useEffect(() => {
    const newTotalPages = Math.ceil(tasks?.length / tasksPerPage);
    if (currentPage >= newTotalPages) {
      setCurrentPage(Math.max(0, newTotalPages - 1));
    }
  }, [tasks, currentPage, tasksPerPage]);

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const handleTaskClose = (taskToRemove) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task !== taskToRemove));
  };

  const handleTaskEdit = (taskToEdit) => {
    setEditTask(taskToEdit);
    setEditedTaskDetails({
      title: taskToEdit.title,
      description: taskToEdit.description,
    });
  };
  const handleEditTaskChange = (e) => {
    const { name, value } = e.target;
    setEditedTaskDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };
  const handleEditTaskSave = () => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task === editTask ? { ...task, ...editedTaskDetails } : task
      )
    );
    setEditTask(null);
  };

  const handleEditTaskCancel = () => {
    setEditTask(null);
  };

  const startIndex = currentPage * tasksPerPage;
  const endIndex = startIndex + tasksPerPage;
  const tasksToDisplay = tasks?.slice(startIndex, endIndex);

  const handleBackButtonClick = async () => {
    navigate(`/createai`);
  };

  const handleCreateProjectButtonClick = async () => {
    const response = await dispatch(
      getImageUrlAsync("1718641051530-ai-default.jpg")
    );
    let finalImageUrl = response?.payload?.presignedUrl;
    let finalImageKey = response?.payload?.imgKey;
    const data = {
      name: aiData?.project,
      description: aiData?.description,
      tasks: tasks,
      creatorUserID: {
        _id: user?._id,
        username: user?.username,
        email: user?.email,
      },
      workspaceID: workspaceID,
      imgUrl: finalImageUrl,
      imgKey: finalImageKey,
    };
    setLoading(true);
    await dispatch(createProjectAIAsync(data));
    setLoading(false);
    navigate("/projects");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        "& > :not(style)": {
          m: 1,
          width: "98%",
          [theme.breakpoints.down("sm")]: {
            maxWidth: "auto",
          },
          [theme.breakpoints.down("md")]: {
            maxWidth: "auto",
          },
        },
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          height: "auto",
        }}
      >
        <Box sx={{ display: "block", alignItems: "center", p: 2 }}>
          <Typography
            variant="body1"
            component="div"
            sx={{ pl: 2, fontWeight: "550", color: "#00c6ff" }}
          >
            Your Project is here!
          </Typography>
          <Typography variant="body2" component="div" sx={{ pl: 2, pt: 0.5 }}>
            Tasks for your new project are ready, thanks to TaskWise AI!
            Customize everything to fit your preferences.
          </Typography>
        </Box>
      </Paper>
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          height: "auto",
          pt: 4,
        }}
      >
        <CustomBox>
          <Box className="pagination">
            <Button
              className="btn-link"
              onClick={handlePrevPage}
              disabled={currentPage === 0 || tasks?.length === 0}
            >
              <BsChevronLeft className="arrow-icon" />
            </Button>
            <div className="task-list">
              <div className="tasks-container">
                {tasksToDisplay?.length === 0 ? (
                  <Typography variant="body1" className="text-center">
                    There was a problem with Taskwise AI. Please try again later
                  </Typography>
                ) : (
                  tasksToDisplay?.map((task, index) => (
                    <div key={index} className="task-card-container">
                      <TaskCard
                        task={task}
                        onClose={() => handleTaskClose(task)}
                        onEdit={() => handleTaskEdit(task)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
            <Button
              className="btn-link"
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1 || tasks?.length === 0}
            >
              <BsChevronRight className="arrow-icon" />
            </Button>
          </Box>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              mt: {
                xs: 5, // Small screens (e.g., mobile)
                sm: 6, // Small to medium screens
                md: 10, // Medium to large screens
                lg: 15, // Large screens
              },
            }}
          >
            <Typography
              sx={{
                width: "100%",
                textAlign: "center",
                backgroundColor: "#f5f5f5",
                borderRadius: 1,
                padding: theme.spacing(1),
                fontSize: "1.5rem",
                marginTop: "22rem",
              }}
            >
              Feel free to edit the tasks to your liking!
            </Typography>
          </Box>
        </CustomBox>
      </Paper>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 4,
        }}
      >
        <Button
          variant="contained"
          className="corner-btn"
          sx={{
            marginRight: "8px",
            marginTop: "25rem",
            marginLeft: "15rem",
            fontWeight: "bold",
            left: "0",
            borderRadius: "16px",
            backgroundColor: "#f0f0f0",
            color: "black",
          }}
          onClick={handleBackButtonClick}
        >
          <BsChevronLeft sx={{ fontSize: "24px", marginRight: "20px" }} />
          <Typography sx={{ pl: "10px" }}>Back</Typography>
        </Button>
        <Button
          variant="contained"
          className="corner-btn generate-board-btn"
          sx={{
            marginRight: "2rem",
            marginTop: "25rem",
            fontWeight: "bold",
            right: "0",
            borderRadius: "16px",
          }}
          disabled={loading}
          onClick={handleCreateProjectButtonClick}
        >
          {loading ? "loading" : "Create Project"}
        </Button>
        <Dialog open={!!editTask} onClose={handleEditTaskCancel}>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Modify the details of your task below.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              type="text"
              fullWidth
              name="title"
              value={editedTaskDetails.title}
              onChange={handleEditTaskChange}
            />
            <TextField
              margin="dense"
              label="Description"
              type="text"
              fullWidth
              name="description"
              value={editedTaskDetails.description}
              onChange={handleEditTaskChange}
              multiline
              rows={4}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditTaskCancel} color="primary">
              Cancel
            </Button>
            <Button onClick={handleEditTaskSave} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default TaskList;
