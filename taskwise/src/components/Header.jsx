import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoImage from "../assets/TaskWiseLogo.png";
import { Link } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutModal from "./LogoutModal";
import Modal from "@mui/material/Modal";
import { useDispatch, useSelector } from "react-redux";
import { logoutAsync } from "../features/user/userSlice";
import Notifications from "./Notifications";
import Badge from "@mui/material/Badge";
import { fetchUnreadNotificationsAsync } from "../features/notification/notificationSlice";
import { SidebarContext } from "../context/SidebarContext";

const settings = ["Settings", "Logout"];

function Header({ isSmallScreen, toggleDrawer }) {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);
  const [openLogoutModal, setOpenLogoutModal] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { setSelected } = useContext(SidebarContext);

  const { status, loggedInUser } = useSelector((state) => state.user);
  const userId = useSelector((state) => state.user.loggedInUser?._id);
  const userImage = useSelector((state) => state.user.loggedInUser?.imgUrl);
  const unreadNotifications = useSelector(
    (state) => state.notification.unreadNotifications
  );

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogoutClick = () => {
    setOpenLogoutModal(true);
    handleCloseUserMenu();
  };

  const handleLogoutClose = () => {
    setOpenLogoutModal(false);
  };

  const handleSettingsClick = () => {
    handleCloseUserMenu();
    navigate("/settings");
  };

  const handleLogoutConfirm = () => {
    dispatch(logoutAsync());
    // dispatch(resetUserState());
  };

  //for notifications
  const handleOpenNotifications = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setAnchorElNotifications(null);
  };

  //for logo click
  const handleLogoClick = () => {
    setSelected("projects");
  };

  useEffect(() => {
    if (userId) {
      dispatch(fetchUnreadNotificationsAsync(userId));
    }
  }, [userId, dispatch]);

  useEffect(() => {
    if (loggedInUser === null) {
      navigate("/");
    }
  }, [status, loggedInUser, navigate]);

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "white" }}>
        <Toolbar
          disableGutters
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          {isSmallScreen && (
            <IconButton
              edge="start"
              color="blue"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ ml: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Link to="/projects" onClick={handleLogoClick}>
              <Box
                component="img"
                sx={{
                  display: { md: "flex" },
                  mr: 1,
                  height: { xs: 30, md: 40, lg: 50, xl: 60 },
                  cursor: "pointer",
                }}
                alt="Logo"
                src={LogoImage}
              />
            </Link>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              pr: { xs: 1, md: 3, lg: 4, xl: 5 },
            }}
          >
            <Tooltip title="Notifications">
              <IconButton
                sx={{ p: 1, mr: { xs: 1, md: 3, lg: 4, xl: 5 } }}
                onClick={handleOpenNotifications}
              >
                <Badge
                  color="error"
                  variant="dot"
                  invisible={unreadNotifications.length === 0}
                  badgeContent={unreadNotifications.length}
                >
                  <NotificationsIcon
                    sx={{
                      fontSize: { xs: 15, md: 20, lg: 25, xl: 30 },
                      color: "black",
                    }}
                  />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 1 }}>
                <Avatar
                  alt="Profile Image"
                  src={userImage}
                  sx={{
                    width: { xs: 15, md: 20, lg: 25, xl: 30 },
                    height: { xs: 15, md: 20, lg: 25, xl: 30 },
                  }}
                />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting}
                  onClick={
                    setting === "Logout"
                      ? handleLogoutClick
                      : setting === "Settings"
                      ? handleSettingsClick
                      : handleCloseUserMenu
                  }
                >
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Popover
        id="notifications-popover"
        open={Boolean(anchorElNotifications)}
        anchorEl={anchorElNotifications}
        onClose={handleCloseNotifications}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box>
          <Notifications />
        </Box>
      </Popover>
      <Modal
        open={openLogoutModal}
        onClose={handleLogoutClose}
        aria-labelledby="logout-model-title"
        aria-describedby="logout-model-description"
      >
        <LogoutModal
          handleClose={handleLogoutClose}
          handleLogout={handleLogoutConfirm}
        />
      </Modal>
    </>
  );
}

export default Header;
