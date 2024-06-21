import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Grid,
  IconButton,
  Typography,
  Paper,
  TextField,
  Dialog,
  DialogContent,
  DialogTitle,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Modal,
  CardMedia,
  Tooltip,
  ButtonBase,
} from "@mui/material";
import PersonAddAltSharpIcon from "@mui/icons-material/PersonAddAltSharp";
import LinkSharpIcon from "@mui/icons-material/LinkSharp";
import LogoutIcon from "@mui/icons-material/Logout";
import ModeEditSharpIcon from "@mui/icons-material/ModeEditSharp";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import ChevronRightSharpIcon from "@mui/icons-material/ChevronRightSharp";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import {
  updateWorkspaceAsync,
  uploadFileAsync,
  fetchWorkspaceMediaAndDocsAsync,
  fetchWorkspaceMembersAsync,
  fetchWorkspaceByIdAsync,
  resetexitMemberStatus,
} from "../../features/workspace/workspaceSlice";
import WorkspaceSettingsMembers from "./WorkspaceSettingsMembers";
import Thumbnail from "../../components/Thumbnail";
import Loading from "../../components/Loading";
import ExitWorkspaceModal from "./Models/ExitWorkspaceModal";
import AddMemberToWorkspaceModal from "./Models/AddMemberToWorkspaceModal";
import ShareJoiningLinkModel from "./Models/ShareJoiningLinkModel";
import AddedMembersModal from "./Models/AddedMembersModal";

const StyledPaper = styled(Paper)(({ theme }) => ({
  height: "400px",
  borderRadius: 2,
}));

const TabLabelWrapper = styled("div")({
  display: "flex",
  alignItems: "center",
});

function WorkspaceSettings({ workspaceId }) {
  const dispatch = useDispatch();
  const membersData = useSelector((state) => state.workspace.selectedMembers);
  const mediaAndDocs = useSelector(
    (state) => state.workspace.selectedMediaAndDocs
  );
  const workspace = useSelector((state) => state.workspace.selectedWorkspace);
  const getWorkspaceMediaAndDocsStatus = useSelector(
    (state) => state.workspace.getWorkspaceMediaAndDocsStatus
  );
  const exitMemberStatus = useSelector(
    (state) => state.workspace.exitMemberStatus
  );
  const errorMessage = useSelector((state) => state.workspace.errors);

  const [selectedImage, setSelectedImage] = useState(workspace.imgUrl);
  const [workspaceText, setWorkspaceText] = useState(workspace.name);
  const [isEditing, setIsEditing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogTab, setDialogTab] = useState(0);
  const [mediaImages, setMediaImages] = useState([]);
  const [docs, setDocs] = useState([]);
  const [open, setOpen] = useState(false);
  const [openShareModel, setOpenShareModel] = useState(false);
  const [openExitModal, setOpenExitModal] = useState(false);
  const [isExitButtonDisabled, setIsExitButtonDisabled] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchWorkspaceByIdAsync(workspaceId));
      dispatch(fetchWorkspaceMembersAsync(workspaceId));
    }
  }, [dispatch, workspaceId]);

  useEffect(() => {
    if (exitMemberStatus === "fulfilled") {
      toast.success("Workspace exited successfully!");
      dispatch(resetexitMemberStatus());
    } else if (exitMemberStatus === "rejected") {
      toast.error(errorMessage, {
        onClose: () => setIsExitButtonDisabled(false),
      });
      dispatch(resetexitMemberStatus());
    }
  }, [exitMemberStatus, dispatch, errorMessage]);

  useEffect(() => {
    if (mediaAndDocs) {
      setMediaImages(mediaAndDocs.imgUrls || []);
      setDocs(mediaAndDocs.docUrls || []);
    }
  }, [mediaAndDocs]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleOpenShareModel = () => setOpenShareModel(true);
  const handleCloseShareModel = () => setOpenShareModel(false);
  const handleOpenExitModal = () => {
    setOpenExitModal(true);
    setIsExitButtonDisabled(true);
  };

  const handleCloseExitModal = () => setOpenExitModal(false);

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
        const { presignedUrl } = response.payload;
        const updatedWorkspace = { ...workspace, imgUrl: presignedUrl };
        dispatch(updateWorkspaceAsync({ id: workspace.id, updatedWorkspace }));
        setSelectedImage(presignedUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    const updatedWorkspace = { ...workspace, name: workspaceText };
    dispatch(updateWorkspaceAsync({ id: workspace.id, updatedWorkspace }));
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleWorkspaceTextChange = (event) => {
    setWorkspaceText(event.target.value);
  };

  const handleDialogOpen = () => {
    dispatch(fetchWorkspaceMediaAndDocsAsync({ workspaceId: workspace.id }));
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setDialogTab(0);
  };

  const handleTabChange = (event, newValue) => {
    setDialogTab(newValue);
    const title = newValue === 0 ? "Media" : "Docs";
    setDialogTitle(title);
  };

  const handleRemoveDoc = (index) => {
    const updatedDocs = docs.filter((_, docIndex) => docIndex !== index);
    setDocs(updatedDocs);
  };

  const loggedInUser = useSelector((state) => state?.user?.loggedInUser);
  const loggedInUserEmail = loggedInUser?.email;
  const loggedInMember = membersData.find(
    (member) => member.user.email === loggedInUserEmail
  );
  const isAdmin = loggedInMember?.role === "Admin";

  const existingMemberEmails = membersData.map((member) => member.user.email);
  const [addedMembersModalOpen, setAddedMembersModalOpen] = useState(false);
  const [addedMembers, setAddedMembers] = useState([]);

  const handleCloseAddedMembersModal = () => setAddedMembersModalOpen(false);

  const handleMemberAdded = (members) => {
    setAddedMembers(members);
    setOpen(false); // Close the Add Member modal after members are added
    setAddedMembersModalOpen(true); // Open the Added Members modal
  };

  return (
    <Grid container spacing={2}>
      <ToastContainer />
      <Grid item xs={12} md={6}>
        <StyledPaper elevation={3}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              marginBottom: "30px",
              p: 1,
            }}
          >
            <Tooltip title={isAdmin ? "click to update image" : ""}>
              <div>
                <Thumbnail
                  selectedImage={selectedImage}
                  handleFileUploadClick={
                    isAdmin ? handleFileUploadClick : undefined
                  }
                  width={150}
                  height={150}
                />
              </div>
            </Tooltip>
            {isAdmin && (
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept="image/*"
                multiple
              />
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", p: 1 }}>
            {isEditing ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  variant="outlined"
                  value={workspaceText}
                  onChange={handleWorkspaceTextChange}
                  autoFocus
                  sx={{ flexGrow: 1 }}
                />
                <IconButton onClick={handleSaveClick} color="primary">
                  <SaveIcon />
                </IconButton>
                <IconButton onClick={handleCancelClick} color="secondary">
                  <CancelIcon />
                </IconButton>
              </Box>
            ) : (
              <React.Fragment>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{ p: 2, fontWeight: "bold" }}
                >
                  {workspaceText}
                </Typography>
                {isAdmin && (
                  <Tooltip title="update name">
                    <IconButton onClick={handleEditClick}>
                      <ModeEditSharpIcon sx={{ color: "#000000" }} />
                    </IconButton>
                  </Tooltip>
                )}
              </React.Fragment>
            )}
          </Box>
          <Box sx={{ mt: 2, display: "flex", alignItems: "center", p: 2 }}>
            <Typography sx={{ fontSize: 15, fontWeight: "bold" }}>
              Media and Docs
            </Typography>
            <IconButton color="primary" onClick={handleDialogOpen}>
              <ChevronRightSharpIcon sx={{ color: "#000000", fontSize: 25 }} />
            </IconButton>
          </Box>
        </StyledPaper>
      </Grid>
      <Grid item xs={12} md={6}>
        <StyledPaper elevation={3}>
          {isAdmin && (
            <>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <ButtonBase
                  onClick={handleOpen}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <IconButton color="primary">
                    <PersonAddAltSharpIcon sx={{ color: "#000000" }} />
                  </IconButton>
                  <Typography
                    sx={{ fontSize: 15, fontWeight: "bold", cursor: "pointer" }}
                  >
                    Add Member
                  </Typography>
                </ButtonBase>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <ButtonBase
                  onClick={handleOpenShareModel}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <IconButton>
                    <LinkSharpIcon
                      sx={{
                        color: "#000000",
                        fontSize: 25,
                        transform: "rotate(135deg)",
                      }}
                    />
                  </IconButton>
                  <Typography
                    sx={{ fontSize: 15, fontWeight: "bold", cursor: "pointer" }}
                  >
                    Invite to workspace via link
                  </Typography>
                </ButtonBase>
              </Box>
            </>
          )}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <WorkspaceSettingsMembers
              membersData={membersData}
              workspaceId={workspace.id}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", marginTop: 2 }}>
            <ButtonBase
              onClick={handleOpenExitModal}
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
              disabled={isExitButtonDisabled}
            >
              <IconButton>
                <LogoutIcon sx={{ fontSize: 30, color: "#000000" }} />
              </IconButton>
              <Typography
                sx={{ fontSize: 15, fontWeight: "bold", cursor: "pointer" }}
              >
                Exit Workspace
              </Typography>
            </ButtonBase>
          </Box>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="add-member-modal-title"
            aria-describedby="add-member-modal-description"
          >
            <Box>
              <AddMemberToWorkspaceModal
                handleClose={handleClose}
                workspaceId={workspace.id}
                existingMemberEmails={existingMemberEmails}
                onMemberAdded={handleMemberAdded}
                open={open} // Pass the open state to AddMemberToWorkspaceModal
              />
            </Box>
          </Modal>
          {addedMembers && addedMembers.length > 0 && (
            <AddedMembersModal
              open={addedMembersModalOpen}
              handleClose={handleCloseAddedMembersModal}
              isWorkspacesPage={false}
              members={addedMembers}
            />
          )}
          <Modal
            open={openShareModel}
            onClose={handleCloseShareModel}
            aria-labelledby="add-member-modal-title"
            aria-describedby="add-member-modal-description"
          >
            <Box>
              <ShareJoiningLinkModel handleClose={handleCloseShareModel} />
            </Box>
          </Modal>
          <Modal
            open={openExitModal}
            onClose={handleCloseExitModal}
            aria-labelledby="exit-workspace-modal-title"
            aria-describedby="exit-workspace-modal-description"
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "background.paper",
                boxShadow: 24,
                p: 4,
                width: "400px",
              }}
            >
              <ExitWorkspaceModal
                handleClose={handleCloseExitModal}
                workspaceId={workspace.id}
              />
            </Box>
          </Modal>
        </StyledPaper>
      </Grid>

      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          {getWorkspaceMediaAndDocsStatus === "loading" ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "200px",
              }}
            >
              <Loading />
            </Box>
          ) : (
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <Tabs
                  value={dialogTab}
                  onChange={handleTabChange}
                  variant="fullWidth"
                >
                  {mediaImages.length > 0 && (
                    <Tab
                      label={
                        <TabLabelWrapper>
                          <ImageOutlinedIcon sx={{ p: 1 }} />
                          <span>Media</span>
                        </TabLabelWrapper>
                      }
                    />
                  )}
                  {docs.length > 0 && (
                    <Tab
                      label={
                        <TabLabelWrapper>
                          <DescriptionOutlinedIcon sx={{ p: 1 }} />
                          <span>Docs</span>
                        </TabLabelWrapper>
                      }
                    />
                  )}
                </Tabs>
              </Grid>
              <Grid
                item
                xs={12}
                style={{ maxHeight: "300px", overflowY: "auto" }}
              >
                {dialogTab === 0 &&
                  (mediaImages.length > 0 ? (
                    <Grid container spacing={1}>
                      {mediaImages.map((image, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                          <Card sx={{ height: "100%" }}>
                            <CardMedia
                              component="img"
                              src={image.imgUrl}
                              alt={`Media ${index + 1}`}
                              height="100"
                              sx={{ objectFit: "cover" }}
                            />
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography sx={{ p: 2, textAlign: "left", color: "#888" }}>
                      No media available
                    </Typography>
                  ))}
                {dialogTab === 1 &&
                  (docs.length > 0 ? (
                    <Box sx={{ p: 2 }}>
                      {docs.map((doc, index) => (
                        <Card key={index} sx={{ mb: 1 }}>
                          <CardContent>
                            <Typography>
                              <a
                                href={doc.docUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {doc.docName}
                              </a>
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <IconButton onClick={() => handleRemoveDoc(index)}>
                              <CloseIcon />
                            </IconButton>
                          </CardActions>
                        </Card>
                      ))}
                    </Box>
                  ) : (
                    <Typography sx={{ p: 2, textAlign: "left", color: "#888" }}>
                      No documents available
                    </Typography>
                  ))}
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </Grid>
  );
}

export default WorkspaceSettings;
