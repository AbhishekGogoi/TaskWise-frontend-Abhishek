import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import WorkspaceCard from "./WorkspaceCard";
import AddIcon from "@mui/icons-material/Add";
import NewWorkspaceModel from "./Models/NewWorkspaceModel";
import Modal from "@mui/material/Modal";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWorkspaceByUserIDAsync,
  resetcreateWorkspaceStatus,
} from "../../features/workspace/workspaceSlice";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/Loading";
// import AddedMembersModal from './Models/AddedMembersModal';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    width: "100%",
  },
}));

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "#f0f0f0",
  marginLeft: 0,
  width: "200px",
  height: "30px",
  display: "flex",
  alignItems: "center",
  transition: theme.transitions.create("width"),
  "&:focus-within": {
    width: "300px",
  },
}));

const CustomBox = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "calc(100vh - 160px)",
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

const NoWorkspacesMessage = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
  width: "100%",
  fontSize: "1.5rem",
  color: theme.palette.text.secondary,
}));

function WorkspacePage() {
  const [openModal, setOpenModal] = useState(false);
  // const [addedMembersModalOpen, setAddedMembersModalOpen] = useState(false);
  // const [addedMembers, setAddedMembers] = useState([]);
  // const [id, setId] = useState('');

  const handleNewWorkspaceClick = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleWorkspaceCreated = (members, id) => {
    if (userId) {
      dispatch(fetchWorkspaceByUserIDAsync(userId));
      // setAddedMembers(members);
      // setId(id);
      setOpenModal(false);
      // setAddedMembersModalOpen(true);
    }
  };

  // const handleCloseAddedMembersModal = () => setAddedMembersModalOpen(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const WorkspaceData = useSelector((state) => state.workspace.workspaces);
  const userId = useSelector((state) => state?.user?.loggedInUser?._id);
  const [searchQuery, setSearchQuery] = useState("");

  const createWorkspaceStatus = useSelector(
    (state) => state.workspace.createWorkspaceStatus
  );
  const errorMessage = useSelector((state) => state.workspace.errors);
  const workspaceFetchStatus = useSelector(
    (state) => state.workspace.workspacesFetchStatus
  );
  const handleSearchChange = (event) => setSearchQuery(event.target.value);

  const filteredWorkspaces = WorkspaceData.filter(
    (workspace) =>
      workspace.name &&
      workspace.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (userId) {
      dispatch(fetchWorkspaceByUserIDAsync(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (createWorkspaceStatus === "fulfilled") {
      toast.success("Workspace created successfully!");
      dispatch(resetcreateWorkspaceStatus());
    }
    if (createWorkspaceStatus === "rejected") {
      toast.error("Workspace not added!");
      dispatch(resetcreateWorkspaceStatus());
    }
  }, [createWorkspaceStatus, errorMessage, dispatch]);

  if (workspaceFetchStatus === "loading") {
    return <Loading />;
  }

  return (
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
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          height: 100,
        }}
      >
        <ToastContainer />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="body1"
            component="div"
            sx={{ p: 2, fontWeight: "bold" }}
          >
            Workspaces
          </Typography>
          <Stack spacing={2} direction="row" sx={{ pr: 2 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleNewWorkspaceClick}
              sx={{ fontSize: "0.70rem", padding: "4px 8px" }}
            >
              New Workspace
            </Button>
          </Stack>
        </Box>
        <Box sx={{ width: "300px", height: "30px", paddingLeft: "15px" }}>
          <Search>
            <SearchIconWrapper>
              <SearchIcon sx={{ color: "gray" }} />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search..."
              inputProps={{ "aria-label": "search" }}
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </Search>
        </Box>
      </Paper>
      <CustomBox>
        {filteredWorkspaces.length > 0 ? (
          <Grid container spacing={3} alignItems="center">
            {filteredWorkspaces.map((workspace) => (
              <Grid item key={workspace.id} xs={6} sm={6} md={3} lg={3} xl={2}>
                <WorkspaceCard
                  workspace={workspace}
                  onClick={() => navigate(`/workspaces/${workspace.id}`)}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <React.Fragment>
            {workspaceFetchStatus === "loading" ? (
              <NoWorkspacesMessage />
            ) : WorkspaceData && WorkspaceData.length === 0 ? (
              <NoWorkspacesMessage>
                Start by adding a new workspace
              </NoWorkspacesMessage>
            ) : (
              <NoWorkspacesMessage>
                No matching workspaces found
              </NoWorkspacesMessage>
            )}
          </React.Fragment>
        )}
      </CustomBox>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="workspace-model-title"
        aria-describedby="workspace-model-description"
      >
        <NewWorkspaceModel
          handleClose={handleCloseModal}
          onWorkspaceCreated={handleWorkspaceCreated}
        />
      </Modal>
      {/* { addedMembers && addedMembers.length > 0 && (
        <AddedMembersModal
          open={addedMembersModalOpen}
          handleClose={handleCloseAddedMembersModal}
          isWorkspacesPage={true}
          members={addedMembers}
          id={id}
        />
      )} */}
    </Box>
  );
}

export default WorkspacePage;
