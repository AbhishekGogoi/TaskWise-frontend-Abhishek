import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Stack,
  Modal,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import { useDispatch, useSelector } from "react-redux";
import {
  updateProfileAsync,
  clearAuthSuccessMessage,
} from "../../features/user/userSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Container = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  paddingTop: "9rem",
  flexGrow: 1,
  width: "100%",
  maxWidth: "800px",
  margin: "auto",
  boxSizing: "border-box",
});

const ProfileHeader = styled(Grid)(({ theme }) => ({
  marginBottom: "20px",
  width: "100%",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
  },
  [theme.breakpoints.up("md")]: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
}));

const ProfileInfo = styled(Grid)({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  gap: "5rem",
});

const InfoBox = styled(Box)({
  backgroundColor: "#f5f5f5",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
});

const EditField = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const ChangePasswordContainer = styled(Box)({
  marginTop: "30px",
  paddingLeft: "20px",
  width: "100%",
});

const ProfileText = styled(Typography)({
  backgroundColor: "#1565c0",
  color: "#ffffff",
  padding: "8px 16px",
  borderRadius: "4px",
  position: "absolute", // Position absolutely
  top: "5rem", // Adjust top position as needed
  left: "14rem", // Adjust left position as needed
});

const PageWrapper = styled(Box)({
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  overflow: "hidden", // Prevent overflow on the main page
});

const ProfileSettingsPage = () => {
  const dispatch = useDispatch();
  const email = useSelector((state) => state.user.loggedInUser?.email);
  const imageUrl = useSelector((state) => state.user.loggedInUser?.imgUrl);

  const username = useSelector((state) => state.user.loggedInUser?.username);
  const successMessage = useSelector((state) => state.user.successMessage);

  const tempTitle = useSelector((state) => state.user.loggedInUser?.title);

  const [title, setTitle] = useState(tempTitle);

  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const handleOpenChangePasswordModal = () => {
    setChangePasswordModalOpen(true);
  };

  const handleCloseChangePasswordModal = () => {
    setChangePasswordModalOpen(false);
  };

  const userId = useSelector((state) => state.user.loggedInUser?._id);

  const handleSubmit = () => {
    setIsButtonDisabled(true);
    if (title === tempTitle) {
      toast.error("No changes made to update the profile.", {
        onClose: () => setIsButtonDisabled(false),
      });
    } else {
      dispatch(updateProfileAsync({ title, userId }));
    }
  };

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage, {
        onClose: () => {
          setIsButtonDisabled(false); // Enable the button
          dispatch(clearAuthSuccessMessage());
        },
      });
    }
  }, [successMessage, dispatch]);

  // Display success message using toast
  const handlePasswordChangeSuccess = (message) => {
    toast.success(message);
    setChangePasswordModalOpen(false);
  };

  // Display error message using toast
  const handlePasswordChangeError = (message) => {
    toast.error(message);
  };

  return (
    <PageWrapper>
      <ProfileText variant="h7">Profile</ProfileText>
      <Container>
        <ProfileHeader container spacing={2}>
          <Grid
            item
            xs={12}
            md={6}
            sx={{ display: "flex", alignItems: "center", gap: "20px" }}
          >
            <Avatar
              alt="Profile Picture"
              src={imageUrl}
              sx={{ width: 80, height: 80 }}
            />
            <Stack spacing={0.5}>
              <Typography variant="h6">{username}</Typography>
              {/* <Typography variant="body2" color="textSecondary">
                @tantriono213
              </Typography> */}
            </Stack>
          </Grid>
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: "flex",
              justifyContent: { xs: "center", md: "flex-end" },
              alignItems: "center",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              sx={{
                minWidth: "200px",
                height: "40px",
              }}
              onClick={handleSubmit}
              disabled={isButtonDisabled}
            >
              Save User Profile
            </Button>
          </Grid>
        </ProfileHeader>

        <ProfileInfo container spacing={2}>
          <Grid item xs={12}>
            <InfoBox>
              <EditField sx={{ paddingBottom: "2rem" }}>
                <Typography variant="body1" component="div">
                  Email: {email}
                </Typography>
              </EditField>
              <EditField>
                <TextField
                  id="title"
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  variant="standard"
                  fullWidth
                />
              </EditField>
            </InfoBox>
          </Grid>
        </ProfileInfo>
        <ChangePasswordContainer>
          <Typography variant="h6">Password & Authentication</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            You can change your password periodically to increase the security
            of your account. Make sure you remember your current password to
            prove that the person who changed the password was actually you.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleOpenChangePasswordModal}
          >
            Change Password
          </Button>
        </ChangePasswordContainer>
        <Modal
          open={changePasswordModalOpen}
          onClose={handleCloseChangePasswordModal}
          aria-labelledby="change-password-modal-title"
        >
          <ChangePasswordModal
            handleClose={handleCloseChangePasswordModal}
            onUpdatePasswordSuccess={handlePasswordChangeSuccess}
            onUpdatePasswordError={handlePasswordChangeError}
          />
        </Modal>
        <ToastContainer />
      </Container>
    </PageWrapper>
  );
};

export default ProfileSettingsPage;
