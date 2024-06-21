import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Column from "./Column";
import { useState } from "react";
import { Box, Paper, Typography, Grid, Stack } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import { Button } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import {
  fetchProjectByIdAsync,
  resetTaskAddStatus,
  moveTaskAsync,
  // resetColumnAddStatus,
  fetchWorkspaceMembersAsync,
} from "../../features/project/projectSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddColumnModal from "./AddColumnModal";

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%", // Start with full width within its container
  },
}));

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "#f0f0f0",
  marginLeft: 0,
  paddingRight: theme.spacing(2), // Add right-side padding
  width: "200px", // Default width
  height: "30px", // Fixed height
  display: "flex",
  alignItems: "center",
  transition: theme.transitions.create("width"), // Animate width change
  "&:focus-within": {
    width: "300px", // Expanded width on focus
  },
}));

function Board() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");

  const initialData = useSelector((state) => state?.project?.selectedProject);

  // eslint-disable-next-line
  const columnAddStatus = useSelector(
    (state) => state.project?.columnAddStatus
  );
  const taskAddStatus = useSelector((state) => state.project?.taskAddStatus);
  // eslint-disable-next-line
  const projectFetchStatus = useSelector(
    (state) => state.project?.projectFetchStatus
  );
  const workspaceId = useSelector(
    (state) => state?.project?.selectedProject?.workspaceId
  );
  // eslint-disable-next-line
  const columnMovedStatus = useSelector(
    (state) => state?.project?.columnorderChangeStatus
  );

  const [order, setOrder] = useState(null);
  const [dataTask, setDataTask] = useState(null);
  const handleClick = () => {
    navigate(`/projects/${id}/new-task`);
  };

  let user = useSelector((state) => state?.user?.loggedInUser);
  let workspaceMembers = useSelector(
    (state) => state?.project?.workspaceMembers?.data
  );
  // eslint-disable-next-line
  const isAdmin =
    workspaceMembers?.find((member) => member.user?.email === user.email)
      ?.role === "Admin";
  const [columns, setColumns] = useState({});
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const handleOpenAddColumnModal = () => {
    setIsAddColumnModalOpen(true);
  };

  const handleCloseAddColumnModal = () => {
    setIsAddColumnModalOpen(false);
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectByIdAsync(id));
    }
    if (workspaceId) {
      dispatch(fetchWorkspaceMembersAsync(workspaceId));
    }
    // eslint-disable-next-line
  }, [workspaceId, id]);

  // useEffect(()=>{
  //   if(columnAddStatus==="fulfilled"){
  //     toast.success("Column added successfully!");
  //   }
  //   if(columnAddStatus==="rejected"){
  //     toast.error("Column not added!");
  //   }
  //   dispatch(resetColumnAddStatus())
  //   // eslint-disable-next-line
  // },[columnAddStatus,dispatch])
  // useEffect(()=>{
  //   if(columnMovedStatus==="fulfilled"){
  //     toast.success("Column moved successfully!");
  //   }
  //   if(columnMovedStatus==="rejected"){
  //     toast.error("Server error");
  //   }
  //   dispatch(resetColumnorderChangeStatus())
  //   // eslint-disable-next-line
  // },[columnMovedStatus,dispatch])

  useEffect(() => {
    if (taskAddStatus === "fulfilled") {
      toast.success("Task added successfully!");
      dispatch(resetTaskAddStatus());
    }
    if (taskAddStatus === "rejected") {
      toast.error("Failed to add task.");
      dispatch(resetTaskAddStatus());
    }
    if (initialData) {
      setColumns(initialData?.columns);
      setOrder(initialData?.order);
      setDataTask(initialData?.tasks);
    }
    // eslint-disable-next-line
  }, [initialData, taskAddStatus, dispatch]);

  const handleDrop = (taskId, newColumnId) => {
    // Clone the columns state
    const updatedColumns = JSON.parse(JSON.stringify(columns));

    // Find the previous column where the task was located
    const previousColumn = updatedColumns.find((column) =>
      column.taskIds.includes(taskId)
    );

    if (previousColumn) {
      // Remove the taskId from the taskIds array of the previous column
      previousColumn.taskIds = previousColumn.taskIds.filter(
        (id) => id !== taskId
      );
    } else {
      //console.error(`Previous column for task ${taskId} not found.`);
    }

    // Find the target column where the task will be moved
    const targetColumn = updatedColumns.find(
      (column) => column._id === newColumnId
    );

    if (targetColumn) {
      // Add the taskId to the taskIds array of the target column
      targetColumn.taskIds.push(taskId);
    } else {
      console.error(`Target column with ID ${newColumnId} not found.`);
    }
    //console.log(previousColumn._id, "previouscolumn")
    const data = {
      sourceColumnId: previousColumn._id,
      destinationColumnId: newColumnId,
    };
    const idObject = { id: id, taskId };
    dispatch(moveTaskAsync({ data, idObject }));

    // Update the state with the modified columns
    setColumns([...updatedColumns]);

    // Log the updated columns for debugging
    //console.log("updatedcolumns", updatedColumns);
  };

  // useEffect(() => {
  //   if (taskAddStatus === "fulfilled") {
  //     toast.success("Task added successfully!");
  //     dispatch(resetTaskAddStatus());
  //   }
  //   if (taskAddStatus === "rejected") {
  //     toast.error("Failed to add task.");
  //     dispatch(resetTaskAddStatus());
  //   }

  // }, [taskAddStatus, dispatch,id]);
  // if (projectFetchStatus === "loading") {
  //   return <div className="loading">Loading...</div>
  // }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          "& > :not(style)": {
            m: 1,
            width: "100%",
          },
        }}
      >
        <ToastContainer />
        <Paper
          elevation={3}
          sx={{
            height: 120,
            maxWidth: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
              <img
                src={initialData?.imgUrl}
                alt="project"
                style={{
                  borderRadius: "8px",
                  width: "44px",
                  height: "44px",
                  padding: "12px",
                }}
              />
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography
                  gutterBottom
                  variant="h6"
                  component="div"
                  sx={{ fontSize: "0.8rem", pt: 1 }}
                >
                  Board / Details
                </Typography>
                <Box>
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="div"
                    sx={{ fontSize: "1rem", pt: 0.5 }}
                  >
                    {initialData?.name}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box padding={"10px"}>
              <Search>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search…"
                  inputProps={{ "aria-label": "search" }}
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </Search>
            </Box>
          </Box>
          <Divider component="div" role="presentation" />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              padding: "8px",
              textAlign: "center",
            }}
          >
            {/* <Button
              variant="contained"
              size="small"
              sx={{
                fontSize: "0.70rem",
                padding: "4px 8px",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              //startIcon={<AddIcon />} // AddIcon will be displayed before the button label
              onClick={handleClick}
            >
              Add new task
            </Button> */}
            <Stack spacing={2} direction="row" sx={{ pr: 2 }}>
              <Button
                variant="contained"
                size="small"
                sx={{ fontSize: "0.70rem", padding: "4px 8px" }}
                onClick={handleOpenAddColumnModal}
              >
                Add new column
              </Button>
              <Button
                variant="contained"
                size="small"
                sx={{ fontSize: "0.70rem", padding: "4px 8px" }}
                onClick={handleClick}
              >
                Add new task
              </Button>
            </Stack>
          </Box>
        </Paper>
        <Box
          sx={{
            display: "flex",
            overflow: "auto",
            width: "100%",
            maxWidth: "1600px",
            padding: 2,
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          <Grid
            container
            spacing={2}
            direction="row"
            wrap="nowrap"
            sx={{ marginTopt: "3" }}
            alignItems="flex-start"
          >
            {order?.map((columnId) => {
              const column = columns?.find((col) => col._id === columnId);
              const tasks = column?.taskIds
                ?.map((taskId) => {
                  const task = dataTask?.find((task) => task._id === taskId);
                  if (!task) {
                    console.warn(`Task with ID ${taskId} not found`);
                  }
                  return task;
                })
                .filter(Boolean);
              //console.log(column, tasks)
              const filteredTasks = tasks?.filter(
                (task) =>
                  (task.content &&
                    task.content
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())) ||
                  (task.title &&
                    task.title.toLowerCase().includes(searchTerm.toLowerCase()))
              );
              return (
                <Grid key={column?.id}>
                  <Column
                    column={column}
                    tasks={filteredTasks}
                    onDrop={handleDrop}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Box>
      <AddColumnModal
        open={isAddColumnModalOpen}
        onClose={handleCloseAddColumnModal}
        //onAddColumn={handleAddColumn}
        id={id}
      />
    </DndProvider>
  );
}

export default Board;
