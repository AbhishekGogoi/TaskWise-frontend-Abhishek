import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { Grid } from "@mui/material";
import ProjectCard from "./ProjectCard";
import NewProjectModel from "../../components/NewProjectModel";
import Modal from "@mui/material/Modal";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProjectAsync,
  resetProjectAddStatus,
} from "../../features/project/projectSlice";
import { fetchWorkspaceByUserIDAsync } from "../../features/workspace/workspaceSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NoWorkspacePage from "../../components/NoWorkspacePage";
import { useNavigate } from "react-router-dom";

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
  width: "200px", // Default width
  height: "30px", // Fixed height
  display: "flex",
  alignItems: "center",
  transition: theme.transitions.create("width"), // Animate width change
  "&:focus-within": {
    width: "300px", // Expanded width on focus
  },
}));
const CustomBox = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "calc(100vh - 160px)",
  overflowY: "auto",
  padding: theme.spacing(2),
  "&::-webkit-scrollbar": {
    display: "none",
  },
  "-ms-overflow-style": "none", // IE and Edge
  "scrollbar-width": "none", // Firefox
}));

function ProjectPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const dispatch = useDispatch();
  const projectData = useSelector((state) => state.project.projects);
  const projectAddStatus = useSelector(
    (state) => state.project.projectAddStatus
  );

  const workspaces = useSelector((state) => state?.workspace?.workspaces);
  const workspaceFetchStatus = useSelector(
    (state) => state?.workspace?.workspaceFetchStatus
  );
  const projectFetchStatus = useSelector(
    (state) => state?.project?.projectFetchStatus
  );
  // console.log(projectData);
  const userId = useSelector((state) => state?.user?.loggedInUser?._id);
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  const filteredProjects = projectData?.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate("/createai");
  };

  //console.log(userId)
  useEffect(() => {
    dispatch(fetchProjectAsync(userId));
    dispatch(fetchWorkspaceByUserIDAsync(userId));
  }, [dispatch, userId]);
  useEffect(() => {
    if (projectAddStatus === "fulfilled") {
      toast.success("Project created successfully!");
      dispatch(resetProjectAddStatus());
    }
    // eslint-disable-next-line
  }, [projectAddStatus]);
  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  if (workspaces.length <= 0 && workspaceFetchStatus === "fulfilled") {
    return <NoWorkspacePage />;
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
            textAlign: "center",
          }}
        >
          <Typography
            variant="body1"
            component="div"
            sx={{ p: 2, fontWeight: "bold" }}
          >
            Projects
          </Typography>
          <Stack spacing={2} direction="row" sx={{ pr: 2 }}>
            <Button
              variant="contained"
              size="small"
              sx={{
                fontSize: "0.70rem",
                padding: "4px 8px",
                backgroundColor: "#00c6ff",
                backgroundImage: "linear-gradient(120deg, #00c6ff, #8e71df)",
                color: "#fff",
              }}
              onClick={handleButtonClick}
            >
              Create with AI
            </Button>
            <Button
              variant="contained"
              size="small"
              sx={{ fontSize: "0.70rem", padding: "4px 8px" }}
              onClick={handleOpenModal}
            >
              New Project
            </Button>
          </Stack>
        </Box>
        <Box sx={{ width: "300px", height: "30px", paddingLeft: "15px" }}>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ "aria-label": "search" }}
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </Search>
        </Box>
      </Paper>
      {projectData?.length <= 0 && projectFetchStatus === "fulfilled" ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "calc(100vh - 200px)", // Adjust height as needed
          }}
        >
          <Typography variant="h6" color="textSecondary">
            Create a Project to get started
          </Typography>
        </Box>
      ) : (
        <CustomBox>
          <Grid container spacing={3} alignItems="center">
            {filteredProjects?.map((project) => (
              <Grid item key={project.id} xs={6} sm={6} md={3} lg={3} xl={2}>
                <ProjectCard project={project} />
              </Grid>
            ))}
          </Grid>
        </CustomBox>
      )}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box>
          <NewProjectModel handleClose={handleCloseModal} />
        </Box>
      </Modal>
    </Box>
  );
}

export default ProjectPage;
