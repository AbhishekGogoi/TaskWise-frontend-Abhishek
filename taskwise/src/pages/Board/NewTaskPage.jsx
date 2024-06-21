import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Grid,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Paper,
  MenuItem,
  Select,
  FormControl,
  FormHelperText,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import {
  addTaskAsync,
  fetchWorkspaceMembersAsync,
} from "../../features/project/projectSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { Skeleton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { uploadFileAsync } from "../../features/workspace/workspaceSlice";
import { resetTaskAddStatus } from "../../features/project/projectSlice";

function NewTaskPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  //const [comments, setComments] = useState([]);
  const [currentComment, setCurrentComment] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState(null);
  const [assignees, setAssignees] = useState(null);
  // eslint-disable-next-line
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ title: "", description: "" });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userId = useSelector((state) => state?.user?.loggedInUser);
  const { id } = useParams();
  //const colId = useSelector((state) => state?.project?.selectedProject?.order[0])
  const coldata = useSelector(
    (state) => state?.project?.selectedProject?.columns
  );
  const workspaceId = useSelector(
    (state) => state?.project?.selectedProject?.workspaceId
  );
  const titlesAndIds = coldata?.map((item) => ({
    title: item.title,
    id: item._id,
  }));
  const membersData = useSelector(
    (state) => state?.project?.workspaceMembers?.data
  );
  const users = membersData?.map((item) => item.user);
  const [options] = useState(users);

  //console.log(users, "membersdata")
  //const [options, setOptions] = useState(membersData.map(item => item.user));
  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setErrors((prevErrors) => ({ ...prevErrors, status: "" }));
  };

  const handlePriorityChange = (event) => {
    setPriority(event.target.value);
    setErrors((prevErrors) => ({ ...prevErrors, priority: "" }));
  };

  const handleAssigneesChange = (event) => {
    setAssignees(event.target.value);
  };

  const validateFields = () => {
    const newErrors = { title: "", description: "", priority: "", status: "" };
    let hasError = false;

    if (!title.trim()) {
      newErrors.title = "Title is required";
      hasError = true;
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
      hasError = true;
    }

    if (!priority) {
      newErrors.priority = "Priority is required";
      hasError = true;
    }

    if (!status) {
      newErrors.status = "Status is required";
      hasError = true;
    }

    setErrors(newErrors);
    return !hasError;
  };

  const handleCommentChange = (event) => {
    const newComment = event.target.value;
    setCurrentComment(newComment);
  };
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [uploadedFileUrls, setUploadedFileUrls] = useState([]);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const newFiles = Array.from(event.target.files).map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type,
      name: file.name,
    }));
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);

    // Iterate over each file in the event
    Array.from(event.target.files).forEach(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await dispatch(uploadFileAsync(formData));
      const newFileUrl = response.payload.presignedUrl;
      let newFileKey, docType;
      if (file.type.startsWith("image/")) {
        newFileKey = response.payload.imgKey;
        docType = "image";
      } else {
        newFileKey = response.payload.fileKey;
        docType = "document";
      }
      setUploadedFileUrls((prevUrls) => [
        ...prevUrls,
        { docType, docName: file.name, docKey: newFileKey, docUrl: newFileUrl },
      ]);
    });
  };

  const handleDelete = (index) => {
    setFiles((prevFiles) => prevFiles.filter((file, i) => i !== index));
    setUploadedFileUrls((prevUrls) => prevUrls.filter((url, i) => i !== index));
  };

  const handleCreateTask = async () => {
    const user = users?.find((user) => user.email === assignees);

    //console.log(uploadedFileUrls)
    if (validateFields()) {
      const task = {
        taskName: title,
        content: description,
        columnId: status,
        dueDate: dueDate,
        priority: priority,
        assigneeUserID: user,
        comments:
          currentComment !== ""
            ? [{ user: userId, comment: currentComment }]
            : [],
        createdBy: userId,
        attachments: uploadedFileUrls, // Include all uploaded file URLs in the task object
      };

      setLoading(true);
      await dispatch(addTaskAsync({ task, id }));
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    if (!e.target.value.trim()) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        title: "Title is required",
      }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, title: "" }));
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    if (!e.target.value.trim()) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        description: "Description is required",
      }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, description: "" }));
    }
  };
  const taskAddStatus = useSelector((state) => state.project.taskAddStatus);
  useEffect(() => {
    dispatch(fetchWorkspaceMembersAsync(workspaceId));
    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    if (taskAddStatus === "fulfilled") {
      navigate(-1);
    } else if (taskAddStatus === "rejected") {
      toast.error("Failed to add task.");
      setLoading(false); // Reset loading state on error
      dispatch(resetTaskAddStatus());
    }
  }, [taskAddStatus, navigate, dispatch]);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        p: 2,
      }}
    >
      <ToastContainer />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10rem",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 3,
            width: "100%",
            maxWidth: "1200px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Grid container spacing={20}>
            {/* Left side - Form Fields */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: "700", mb: 1, fontSize: "1rem" }}
              >
                Add a title <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                variant="outlined"
                fullWidth
                placeholder="Title"
                value={title}
                onChange={handleTitleChange}
                sx={{
                  mb: 4,
                }}
                error={!!errors.title}
                helperText={errors.title}
              />

              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: "700", mb: 1, fontSize: "1rem" }}
              >
                Add a description <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                variant="filled"
                fullWidth
                multiline
                rows={4}
                placeholder="Add your description here"
                value={description}
                onChange={handleDescriptionChange}
                sx={{
                  mb: 4,
                  "& .MuiFilledInput-root": {
                    backgroundColor: "white",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  },
                }}
                error={!!errors.description}
                helperText={errors.description}
              />

              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: "700", mb: 1, fontSize: "1rem" }}
              >
                Ask a question or add a comment
              </Typography>
              <TextField
                variant="outlined"
                fullWidth
                placeholder="Ask a question or add a comment"
                value={currentComment}
                onChange={handleCommentChange}
                sx={{
                  mb: 2,
                }}
              />

              <Box sx={{ mt: 3, mb: 4, display: "flex" }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: "700", fontSize: "1rem", mt: 2 }}
                >
                  Due Date
                </Typography>
                <TextField
                  //label="Select due date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  sx={{
                    height: 32,
                    width: "300px",
                    marginLeft: "20px",
                  }}
                />
              </Box>
            </Grid>

            {/* Right side - Task Details */}
            <Grid item xs={12} md={6}>
              <Grid container spacing={4}>
                <Grid
                  item
                  xs={12}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: "700", mb: 1, fontSize: "1rem" }}
                  >
                    Assign to
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexGrow: 1,
                      ml: 4,
                    }}
                  >
                    {options ? (
                      <Select
                        value={assignees}
                        onChange={handleAssigneesChange}
                        sx={{
                          height: 32,
                          width: "100%",
                          maxWidth: 200,
                        }}
                      >
                        <MenuItem value="" disabled>
                          Select
                        </MenuItem>
                        {options.map((option) => (
                          <MenuItem key={option.id} value={option.email}>
                            {option.email}
                          </MenuItem>
                        ))}
                      </Select>
                    ) : (
                      <Skeleton variant="rectangular" width={200} height={32} />
                    )}
                  </Box>
                </Grid>

                <Grid
                  item
                  xs={12}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: "700",
                      mb: 1,
                      fontSize: "1rem",
                      mr: "2.5",
                    }}
                  >
                    Priority <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexGrow: 1,
                      ml: 6,
                    }}
                  >
                    <FormControl
                      sx={{ width: "100%", maxWidth: 200 }}
                      error={!!errors.priority}
                    >
                      <Select
                        value={priority}
                        onChange={handlePriorityChange}
                        displayEmpty
                        inputProps={{ "aria-label": "Priority Level" }}
                        sx={{ height: 32 }}
                      >
                        <MenuItem value="" disabled>
                          Level
                        </MenuItem>
                        <MenuItem value="Low">Low</MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="High">High</MenuItem>
                      </Select>
                      {!!errors.priority && (
                        <FormHelperText>{errors.priority}</FormHelperText>
                      )}
                    </FormControl>
                  </Box>
                </Grid>

                <Grid
                  item
                  xs={12}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <Box
                    sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontWeight: "700",
                        mr: 2, // Add some right margin to the Typography component to space it from the Select component
                        textAlign: "center",
                        alignItems: "center",
                        mb: 1,
                        fontSize: "1rem",
                      }}
                    >
                      Status <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        flexGrow: 1,
                        ml: 5,
                      }}
                    >
                      <FormControl
                        sx={{ width: "100%", maxWidth: 200 }}
                        error={!!errors.status}
                      >
                        <Select
                          value={status}
                          onChange={handleStatusChange}
                          displayEmpty
                          inputProps={{ "aria-label": "Set Status" }}
                          sx={{ height: 32 }}
                        >
                          <MenuItem value="" disabled>
                            Set Status
                          </MenuItem>
                          {titlesAndIds?.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                              {item.title}
                            </MenuItem>
                          ))}
                        </Select>
                        {!!errors.status && (
                          <FormHelperText>{errors.status}</FormHelperText>
                        )}
                      </FormControl>
                    </Box>
                  </Box>
                </Grid>

                <Grid container spacing={2} sx={{ mt: 2, ml: 2 }}>
                  <Grid
                    item
                    xs={12}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: "700", mb: 1, fontSize: "1rem" }}
                    >
                      Attachments
                    </Typography>
                    <Box sx={{ ml: "3rem" }}>
                      <IconButton onClick={handleUploadClick}>
                        <AddOutlinedIcon />
                      </IconButton>
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                        accept="image/*,application/pdf"
                        multiple
                      />
                    </Box>
                  </Grid>
                  <Box
                    sx={{
                      maxHeight: "400px",
                      overflow: "scroll",
                      "&::-webkit-scrollbar": {
                        display: "none",
                      },
                    }}
                  >
                    {files.map((file, index) => (
                      <Grid item xs={12} key={index} sx={{ mt: 2, ml: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {file.type.startsWith("image/") ? (
                            <img
                              src={file.url}
                              alt={file.name}
                              style={{
                                maxWidth: "50%",
                                height: "auto",
                                marginRight: "1rem",
                              }}
                            />
                          ) : (
                            <embed
                              src={file.url}
                              type="application/pdf"
                              width="50%"
                              height="300px"
                              style={{ marginRight: "1rem" }}
                            />
                          )}
                          <IconButton onClick={() => handleDelete(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Box sx={{ mt: 5, width: "100%" }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  sx={{
                    backgroundColor: "#f0f0f0",
                    "&:hover": {
                      backgroundColor: "#d0d0d0",
                    },
                  }}
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  disabled={taskAddStatus === "pending"}
                  color="primary"
                  fullWidth
                  onClick={handleCreateTask}
                >
                  {taskAddStatus === "pending"
                    ? "Creating Task..."
                    : "Create Task"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default NewTaskPage;
