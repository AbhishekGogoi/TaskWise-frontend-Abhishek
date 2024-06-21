import React, { useState, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import StarIcon from "@mui/icons-material/Star";
import CloseIcon from "@mui/icons-material/Close";
import PropTypes from "prop-types";
import Thumbnail from "../../../components/Thumbnail";
import { useDispatch, useSelector } from "react-redux";
import { addProjectAsync } from "../../../features/project/projectSlice";
import {
  uploadFileAsync,
  getImageUrlAsync,
} from "../../../features/workspace/workspaceSlice";

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

const NewWorkspaceProjectModel = ({
  handleClose,
  workspace,
  onProjectCreated,
}) => {
  const dispatch = useDispatch();
  const creatorUserID = useSelector((state) => state?.user?.loggedInUser?._id);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [imageUrl, setImageUrl] = useState("");
  const [imageKey, setImageKey] = useState("");

  const handleFileUploadClick = () => {
    fileInputRef.current.click();
  };

  const validateForm = () => {
    const newErrors = {};
    if (!name) {
      newErrors.name = "Project Name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (validateForm()) {
      let finalImageUrl = imageUrl;
      let finalImageKey = imageKey;
      if (!selectedImage) {
        try {
          const response = await dispatch(
            getImageUrlAsync("1717579493959-projectimages.jpg")
          );
          finalImageUrl = response.payload.presignedUrl;
          finalImageKey = response.payload.imgKey;
        } catch (error) {
          console.error("Error generating pre-signed URL:", error);
          return;
        }
      }

      const projectData = {
        name: name,
        description: description,
        workspaceID: workspace.id,
        imgUrl: finalImageUrl,
        imgKey: finalImageKey,
        creatorUserID: creatorUserID,
      };

      try {
        await dispatch(addProjectAsync(projectData));
        onProjectCreated(); // Call the callback to refresh projects
        handleClose();
      } catch (error) {
        console.error("Error creating project:", error);
      }
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
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

  const handleNameChange = (event) => {
    setName(event.target.value);
    if (event.target.value) {
      setErrors((prevErrors) => ({ ...prevErrors, name: null }));
    }
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
          id="project-title"
          variant="h5"
          component="h2"
          style={{ fontWeight: 550 }}
        >
          New Project
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Typography
        id="project-thumbnail"
        style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}
      >
        Thumbnail{" "}
        <StarIcon
          style={{ color: "gray", marginLeft: "2px", fontSize: "xx-small" }}
        />
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "left",
          alignItems: "left",
          marginBottom: "20px",
          cursor: "pointer",
        }}
        onClick={handleFileUploadClick}
      >
        <Thumbnail selectedImage={selectedImage} width={80} height={80} />
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </Box>
      <TextField
        id="project-name"
        label="Project Name *"
        fullWidth
        margin="normal"
        style={{ marginBottom: "20px", backgroundColor: "white" }}
        value={name}
        onChange={handleNameChange}
        error={!!errors.name}
        helperText={errors.name}
      />
      <TextField
        id="project-description"
        label="Project Description"
        fullWidth
        margin="normal"
        style={{ marginBottom: "20px", backgroundColor: "white" }}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ textTransform: "none" }}
        onClick={handleCreate}
      >
        Create Project
      </Button>
    </Box>
  );
};

NewWorkspaceProjectModel.propTypes = {
  handleClose: PropTypes.func.isRequired,
  workspace: PropTypes.object.isRequired, // Updated PropType to object
  onProjectCreated: PropTypes.func.isRequired, // New prop for callback
};

export default NewWorkspaceProjectModel;
