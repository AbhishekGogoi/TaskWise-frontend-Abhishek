import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Box,
  Paper,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  updateMemberRoleAsync,
  fetchWorkspaceMembersAsync,
  removeMemberAsync,
} from "../../features/workspace/workspaceSlice"; // Assuming you have a fetchMembers action

const StyledPaper = styled(Paper)(({ theme }) => ({
  height: "200px",
  width: "150%",
  padding: theme.spacing(1),
  overflowY: "auto",
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    background: "#f1f1f1",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#888",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: "#555",
  },
}));

function WorkspaceSettingsMembers({ membersData, workspaceId }) {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const loggedInUser = useSelector((state) => state?.user?.loggedInUser);
  const loggedInUserEmail = loggedInUser?.email;

  const loggedInMember = membersData.find(
    (member) => member.user.email === loggedInUserEmail
  );
  const isAdmin = loggedInMember?.role === "Admin";

  const handleMenuOpen = (event, member) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const handleRoleChange = async (role) => {
    try {
      await dispatch(
        updateMemberRoleAsync({
          workspaceId,
          adminUserId: loggedInMember.user.id,
          userId: selectedMember.user.id,
          role,
        })
      );
      // If the update is successful, fetch the updated member list
      await dispatch(fetchWorkspaceMembersAsync(workspaceId)); // Assuming fetchMembers fetches the updated member list
    } catch (error) {
      console.error("Failed to update member role:", error);
    }
    handleMenuClose();
  };

  const handleRemoveMember = async () => {
    try {
      await dispatch(
        removeMemberAsync({
          workspaceId,
          adminUserId: loggedInMember.user.id,
          memberEmails: [selectedMember.user.email],
        })
      );
      // If the update is successful, fetch the updated member list
      await dispatch(fetchWorkspaceMembersAsync(workspaceId)); // Assuming fetchMembers fetches the updated member list
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
    handleMenuClose();
  };

  const sortedMembers = [...membersData].sort((a, b) => {
    if (a.role === "Admin" && b.role !== "Admin") return -1;
    if (a.role !== "Admin" && b.role === "Admin") return 1;
    return 0;
  });

  const memberCount = sortedMembers.length;
  const memberList =
    memberCount === 0 ? (
      <Typography sx={{ textAlign: "center", paddingTop: 2 }}>
        Please add members
      </Typography>
    ) : (
      <List sx={{ width: "100%" }}>
        {sortedMembers.map((member) => (
          <ListItem key={member.id} sx={{ justifyContent: "space-evenly" }}>
            <ListItemAvatar>
              <Avatar
                alt={member.user.email}
                src={member.user.imgUrl}
                sx={{ fontWeight: 10 }}
              />
            </ListItemAvatar>
            <ListItemText
              primary={member.user.email}
              secondary={member.role === "Admin" ? "Admin" : null} // Show 'Admin' as secondary text for admin members
              sx={{
                fontSize: 12,
                display: "flex",
                justifyContent: "space-between",
              }}
            />
            {isAdmin &&
              member.role !== "Admin" && ( // Only render action button for non-admin users if logged-in user is admin
                <IconButton
                  aria-label="more"
                  aria-controls="long-menu"
                  aria-haspopup="true"
                  onClick={(event) => handleMenuOpen(event, member)}
                >
                  <MoreVertIcon />
                </IconButton>
              )}
          </ListItem>
        ))}
      </List>
    );

  return (
    <StyledPaper sx={{ marginTop: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: 2,
        }}
      >
        <Typography
          sx={{
            paddingTop: 0.5,
            paddingLeft: 1,
            fontSize: 15,
            fontWeight: "bold",
          }}
        >
          Members ({memberCount})
        </Typography>
      </Box>
      {memberList}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {isAdmin && ( // Only render action for making someone an admin if logged-in user is admin
          <>
            <MenuItem onClick={() => handleRoleChange("Admin")}>
              Make Admin
            </MenuItem>
            <MenuItem onClick={() => handleRemoveMember()}>Remove</MenuItem>
          </>
        )}
      </Menu>
    </StyledPaper>
  );
}

export default WorkspaceSettingsMembers;
