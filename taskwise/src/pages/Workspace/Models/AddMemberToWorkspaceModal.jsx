import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Chip from "@mui/material/Chip";
import Modal from "@mui/material/Modal";
import {
  addMemberAsync,
  fetchWorkspaceMembersAsync,
  fetchExistingDataAsync,
} from "../../../features/workspace/workspaceSlice";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "none",
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AddMemberToWorkspaceModal = ({
  handleClose,
  workspaceId,
  existingMemberEmails,
  onMemberAdded,
  open,
}) => {
  const [members, setMembers] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [membersError, setMembersError] = useState("");
  const [validEmails, setValidEmails] = useState([]);
  const dispatch = useDispatch();
  const adminUserId = useSelector((state) => state?.user?.loggedInUser?._id);
  const existingUserEmails = useSelector(
    (state) => state.workspace?.existingUserEmails || []
  );

  useEffect(() => {
    dispatch(fetchExistingDataAsync({ collection: "User", key: "email" }));
  }, [dispatch]);

  const handleAddMember = (event) => {
    if (event.key === "Enter" || event.key === "," || event.key === " ") {
      event.preventDefault();
      const email = inputValue.trim();
      if (email && emailRegex.test(email)) {
        if (existingMemberEmails.includes(email)) {
          setMembersError("This email address is already a member.");
        } else if (!existingUserEmails.includes(email)) {
          setMembersError(
            "Oops! This email is not part of TaskWise. Please clear the input and try again."
          );
        } else if (!members.includes(email)) {
          setMembers((prevMembers) => [...prevMembers, email]);
          setValidEmails((prevValidEmails) => [...prevValidEmails, email]);
          setInputValue("");
          setMembersError("");
        } else {
          setMembersError("Email address already added.");
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

  const handleDeleteMember = (emailToDelete) => () => {
    setMembers((prevMembers) =>
      prevMembers.filter((email) => email !== emailToDelete)
    );
    setValidEmails((prevValidEmails) =>
      prevValidEmails.filter((email) => email !== emailToDelete)
    );
  };

  const handleAddButtonClick = async () => {
    try {
      if (validEmails.length === 0) {
        setMembersError(
          "Please enter valid email addresses. No members to add."
        );
        return;
      }
      await dispatch(
        addMemberAsync({ workspaceId, adminUserId, memberEmails: validEmails })
      );
      await dispatch(fetchWorkspaceMembersAsync(workspaceId));
      onMemberAdded(members);
      handleClose(); // Close the modal after adding members
    } catch (error) {
      console.error("Error adding member:", error);
      setMembersError(
        "An error occurred while adding members. Please try again."
      );
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
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
            style={{ fontWeight: 550, fontSize: 20 }}
          >
            Add people to my workspace
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
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
        />
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            marginBottom: "20px",
          }}
        >
          {members.map((email, index) => (
            <Chip
              key={index}
              label={email}
              onDelete={handleDeleteMember(email)}
            />
          ))}
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            sx={{ textTransform: "none", backgroundColor: "#f0f0f0" }}
            onClick={handleClose}
            disabled={!!membersError}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{ textTransform: "none" }}
            onClick={handleAddButtonClick}
            disabled={!!membersError || validEmails.length === 0}
          >
            Add
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

AddMemberToWorkspaceModal.propTypes = {
  handleClose: PropTypes.func.isRequired,
  workspaceId: PropTypes.string.isRequired,
  existingMemberEmails: PropTypes.arrayOf(PropTypes.string).isRequired,
  open: PropTypes.bool.isRequired,
  onMemberAdded: PropTypes.func.isRequired,
};

export default AddMemberToWorkspaceModal;
