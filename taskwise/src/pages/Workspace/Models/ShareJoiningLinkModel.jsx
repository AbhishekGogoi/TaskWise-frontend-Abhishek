import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Modal,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LinkSharpIcon from "@mui/icons-material/LinkSharp";

const ShareJoiningLinkModal = ({ handleClose }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isSmallScreen ? "90%" : 400,
    maxWidth: "90%",
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: 4,
    p: 3,
  };

  const handleCopy = () => {
    const linkToCopy = "https://taskwiseapp.netlify.app/signup"; // Replace with your actual link
    navigator.clipboard
      .writeText(linkToCopy)
      .then(() => {
        console.log("Link copied to clipboard");
        // Optionally you can add a success message or state update here
      })
      .catch((error) => {
        console.error("Error copying link to clipboard: ", error);
        // Handle error, perhaps by showing an error message to the user
      });
  };

  return (
    <Modal open onClose={handleClose}>
      <Box sx={modalStyle}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", textAlign: "center", flexGrow: 1 }}
          >
            Share Joining Link
          </Typography>
          <IconButton onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box
          sx={{
            display: "flex",
            flexDirection: isSmallScreen ? "column" : "row",
            alignItems: "center",
          }}
        >
          <LinkSharpIcon
            sx={{
              mr: isSmallScreen ? 0 : 1,
              mb: isSmallScreen ? 1 : 0,
              transform: "rotate(135deg)",
              fontSize: 30,
            }}
          />
          <Typography
            variant="body2"
            sx={{
              fontSize: 14,
              color: "text.secondary",
              flexGrow: 1,
              mb: isSmallScreen ? 1 : 0,
            }}
          >
            https://taskwiseapp.netlify.app/signup
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{
              ml: isSmallScreen ? 0 : 1,
              mt: isSmallScreen ? 1 : 0,
              textTransform: "none",
            }}
            onClick={handleCopy}
          >
            Copy
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

ShareJoiningLinkModal.propTypes = {
  handleClose: PropTypes.func.isRequired,
};

export default ShareJoiningLinkModal;
