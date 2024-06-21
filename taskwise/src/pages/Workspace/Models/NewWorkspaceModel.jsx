import React, { useState, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Chip from "@mui/material/Chip";
import PropTypes from "prop-types";
import Thumbnail from "../../../components/Thumbnail";
import { useDispatch, useSelector } from "react-redux";
import {
  createWorkspaceAsync,
  uploadFileAsync,
  getImageUrlAsync,
  fetchExistingDataAsync,
} from "../../../features/workspace/workspaceSlice";
import ModeEditSharpIcon from "@mui/icons-material/ModeEditSharp";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px none #000",
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NewWorkspaceModel = ({ handleClose, onWorkspaceCreated }) => {
  const dispatch = useDispatch();
  const loggedInUser = useSelector((state) => state.user?.loggedInUser);
  const existingWorkspaceName = useSelector(
    (state) => state.workspace?.existingWorkspaceName || []
  );
  const existingUserEmails = useSelector(
    (state) => state.workspace?.existingUserEmails || []
  );
  const newdWorkspaceData = useSelector(
    (state) => state.workspace?.newdWorkspace || {}
  );

  const [workspaceName, setWorkspaceName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageKey, setImageKey] = useState("");
  const [nameError, setNameError] = useState("");
  const [membersError, setMembersError] = useState("");
  const [isNameChecked, setIsNameChecked] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(
          fetchExistingDataAsync({ collection: "Workspace", key: "name" })
        );
        await dispatch(
          fetchExistingDataAsync({ collection: "User", key: "email" })
        );
      } catch (error) {
        console.error("Error fetching existing data:", error);
      }
    };

    fetchData();
  }, [dispatch]);

  const handleFileUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await dispatch(uploadFileAsync(formData));
        setImageUrl(response.payload.presignedUrl);
        setImageKey(response.payload.imgKey);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) {
      setNameError("Workspace name is required.");
      return;
    }

    let finalImageUrl = imageUrl;
    let finalImageKey = imageKey;

    if (!imageUrl) {
      try {
        const response = await dispatch(
          getImageUrlAsync("1717581391326-ws-image.jpg")
        );
        finalImageUrl = response.payload.presignedUrl;
        finalImageKey = response.payload.imgKey;
      } catch (error) {
        console.error("Error generating pre-signed URL:", error);
        return;
      }
    }

    const newWorkspace = {
      name: workspaceName,
      description,
      imgKey: finalImageKey,
      imgUrl: finalImageUrl,
      creatorUserID: loggedInUser?._id,
      memberEmails: members,
    };

    try {
      await dispatch(createWorkspaceAsync(newWorkspace));
      onWorkspaceCreated(members, newdWorkspaceData?.workspace?.id);
      handleClose();
    } catch (error) {
      console.error("Error creating workspace:", error);
    }
  };

  const handleAddMember = (event) => {
    if (event.key === "Enter" || event.key === "," || event.key === " ") {
      event.preventDefault();
      const email = inputValue.trim();
      if (email && emailRegex.test(email)) {
        if (email === loggedInUser?.email) {
          setMembersError("You cannot add your own email as a member.");
        } else if (members.includes(email)) {
          setMembersError("Email address already added.");
        } else if (!existingUserEmails.includes(email)) {
          setMembersError(
            "Email is not part of TaskWise, Please remove data and Press Enter..."
          );
        } else {
          setMembers((prevMembers) => [...prevMembers, email]);
          setInputValue("");
          setMembersError("");
        }
      } else {
        setMembersError("Invalid email address.");
      }
    }

    // Check if inputValue is empty to enable the button
    if (inputValue.trim() === "") {
      setMembersError(""); // Reset any previous error message
    }
  };

  const handleWorkspaceNameChange = (e) => {
    const value = e.target.value;
    setWorkspaceName(value);
    setIsNameChecked(false);

    if (value.trim()) {
      setNameError("");
    } else {
      setNameError("Workspace name is required.");
    }
  };

  const handleWorkspaceNameCheck = async (event) => {
    if (event.key === "Enter" && workspaceName.trim()) {
      if (existingWorkspaceName.includes(workspaceName.trim())) {
        setNameError("Workspace name is already taken.");
      } else {
        setNameError("");
      }
      setIsNameChecked(true);
    }
  };

  const handleDeleteMember = (emailToDelete) => () => {
    setMembers((members) => members.filter((email) => email !== emailToDelete));
  };

  return (
    <Box sx={style}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <Typography
          id="workspace-title"
          variant="h5"
          component="h2"
          style={{ fontWeight: 550 }}
        >
          New Workspace
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Typography
        id="workspace-thumbnail"
        style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}
      >
        Thumbnail
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "left",
          alignItems: "left",
          marginBottom: "20px",
        }}
      >
        <Thumbnail
          selectedImage={imageUrl}
          handleFileUploadClick={handleFileUploadClick}
          width={80}
          height={80}
        />
        <IconButton onClick={handleFileUploadClick}>
          <ModeEditSharpIcon sx={{ color: "#000000" }} />
        </IconButton>
      </Box>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <TextField
        id="workspace-name"
        label="Workspace Name * (press Enter to check availability)"
        fullWidth
        margin="normal"
        style={{ marginBottom: "20px", backgroundColor: "white" }}
        value={workspaceName}
        onChange={handleWorkspaceNameChange}
        onKeyDown={handleWorkspaceNameCheck}
        error={!!nameError}
        helperText={nameError}
      />
      <TextField
        id="workspace-description"
        label="Workspace Description"
        fullWidth
        margin="normal"
        style={{ marginBottom: "20px", backgroundColor: "white" }}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={!isNameChecked || !!nameError}
      />
      <TextField
        id="workspace-add-members"
        label="Add Members (press Enter to add)"
        fullWidth
        margin="normal"
        style={{ marginBottom: "20px", backgroundColor: "white" }}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleAddMember}
        error={!!membersError}
        helperText={membersError}
        disabled={!isNameChecked || !!nameError}
      />
      <Box
        sx={{ display: "flex", flexWrap: "wrap", gap: 1, marginBottom: "20px" }}
      >
        {members.map((email) => (
          <Chip
            key={email}
            label={email}
            onDelete={handleDeleteMember(email)}
          />
        ))}
      </Box>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ textTransform: "none" }}
        onClick={handleCreateWorkspace}
        disabled={
          !!nameError ||
          !!membersError ||
          !isNameChecked ||
          inputValue.trim() !== ""
        }
      >
        Create Workspace
      </Button>
    </Box>
  );
};

NewWorkspaceModel.propTypes = {
  handleClose: PropTypes.func.isRequired,
  onWorkspaceCreated: PropTypes.func.isRequired,
};

export default NewWorkspaceModel;
