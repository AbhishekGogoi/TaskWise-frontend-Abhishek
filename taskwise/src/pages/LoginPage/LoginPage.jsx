import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  TextField,
  InputAdornment, // For adding icons to TextFields
  Button,
  Typography,
  Link,
  CircularProgress,
} from "@mui/material";
import { Email, Lock } from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Joi from "joi";
import { styled } from "@mui/system";
import TaskWiseLogo from "../../assets/TaskWiseLogo.png";
import { useDispatch } from "react-redux";
import {
  loginAsync,
  clearLoginError,
  resetLoginStatus,
  clearAuthSuccessMessage,
} from "../../features/user/userSlice";
import { useSelector } from "react-redux";
import { useEffect } from "react";

// Styles
const StyledContainer = styled(Container)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  padding: "2rem",
  elevation: 10,
  borderRadius: "8px", // Add padding to the container
});

const StyledForm = styled("form")(({ theme }) => ({
  width: 350,
  paddingLeft: "4rem",
  paddingRight: "4rem",
  paddingBottom: "1.5rem",
  paddingTop: "4rem",
  border: "1px solid #e0e0e0",
  borderRadius: "40px",

  // Responsive adjustments using theme breakpoints
  [theme.breakpoints.down("md")]: {
    paddingLeft: "2rem", // Reduce padding on medium screens and smaller
    paddingRight: "2rem",
  },
  [theme.breakpoints.down("sm")]: {
    paddingLeft: "1rem", // Further reduce padding on small screens
    paddingRight: "1rem",
    width: "100%", // Make it full width
    paddingTop: "2rem", // Adjust top padding
    paddingBottom: "2rem", // Adjust bottom padding
  },
}));

const StyledTypography = styled(Typography)({
  fontFamily: "Manrope, sans-serif", // Example font (adjust as needed)
  fontWeight: 600,
  fontSize: "30px", // Slightly bolder font
});

const StyledLink = styled(Link)({
  color: "#0062ff",
  fontSize: "15px",
  fontWeight: 650,
  textDecoration: "none", // Remove default underline
  "&:hover": {
    textDecoration: "underline",
    cursor: "pointer", // Add underline on hover
  }, // Example link color
});

const StyledTitleContainer = styled(Box)({
  // New container for title
  marginBottom: "1rem", // Add some space below the title
  textAlign: "center", // Center align the title
});

const StyledSignUpLink = styled(Link)({
  color: "#0062ff", // Blue link color
  fontWeight: 650,
  fontSize: "18px", // Semi-bold font weight
  textDecoration: "none", // Remove default underline
  "&:hover": {
    textDecoration: "underline",
    cursor: "pointer", // Add underline on hover
  },
});

const StyledButton = styled(Button)({
  height: 50, // Increase button height
  fontSize: "1rem", // Adjust font size (optional)
});

// Component
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const location = useLocation();

  const loggedInUser = useSelector((state) => state.user.loggedInUser);
  const loginError = useSelector((state) => state.user.loginError);
  const successMessage = useSelector((state) => state.user.successMessage);
  // console.log(loginError?.message);

  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.empty": "Email is required",
        "string.email": "Email must be a valid email",
      }),
    password: Joi.string()
      .pattern(
        new RegExp(
          "^[a-zA-Z0-9!@#\\$%\\^&\\*\\(\\)_\\+\\-=[\\]{};:'\",<>\\.\\?/`~]{7,}$"
        )
      )
      .required()
      .messages({
        "string.empty": "Password is required",
        "string.pattern.base":
          "Password must be at least 7 characters and contain only letters, numbers, and special characters",
      }),
  });

  const handleLogin = (e) => {
    e.preventDefault();
    const { error } = schema.validate(
      { email, password },
      { abortEarly: false }
    );

    if (error) {
      const validationErrors = {};
      error.details.forEach((detail) => {
        validationErrors[detail.path[0]] = detail.message;
      });
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoginLoading(true); // Set loading state to true
    dispatch(loginAsync({ email, password }));
    setIsButtonDisabled(true); // Disable the button after login attempt
  };

  useEffect(() => {
    if (loginError) {
      toast.error(loginError.message, {
        onClose: () => {
          setLoginLoading(false); // Set loading state to false on error
          setIsButtonDisabled(false);
          dispatch(clearLoginError()); // Clear the error after displaying it
          dispatch(resetLoginStatus());
        },
      });
    }
  }, [loginError, dispatch]);

  useEffect(() => {
    if (loggedInUser) {
      navigate("/projects");
    }
  }, [loggedInUser, navigate]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage, {
        onClose: () => {
          dispatch(clearAuthSuccessMessage());
        },
      });
    }
  }, [successMessage, dispatch]);

  const handleSignUpClick = () => {
    navigate("/signup"); // Navigate to signup page
  };

  const handleForgotPasswordClick = () => {
    navigate("/forgotpassword"); // Navigate to forgot password page
  };

  return (
    <StyledContainer>
      <img
        src={TaskWiseLogo}
        alt="TaskWise Logo"
        style={{
          width: 300,
          maxWidth: "80%",
          height: "auto",
          marginBottom: "2rem",
          display: "block", // Make the image a block element
          margin: "0 auto", // Center it horizontally
        }}
      />
      <StyledForm sx={{ boxShadow: 3 }}>
        <StyledTitleContainer>
          <StyledTypography component="h1" variant="h5" align="center">
            Log In
          </StyledTypography>
        </StyledTitleContainer>
        <TextField // Email field with icon
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          placeholder="Your email" // Adjusted label
          name="email"
          autoComplete="email"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email />
              </InputAdornment>
            ),
          }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!errors.email}
          helperText={errors.email}
        />
        <TextField // Password field with icon
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          placeholder="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock />
              </InputAdornment>
            ),
          }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!errors.password}
          helperText={errors.password}
        />
        <StyledButton
          type="submit"
          fullWidth
          variant="contained"
          sx={{
            marginTop: "1rem",
            backgroundColor: "#0062ff",
            "&:hover": { backgroundColor: "#303f9f" },
          }}
          onClick={handleLogin}
          disabled={isButtonDisabled}
        >
          {loginLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Log In"
          )}
        </StyledButton>
        <StyledLink
          onClick={handleForgotPasswordClick}
          variant="body2"
          sx={{ display: "block", textAlign: "center", marginTop: "1.5rem" }}
        >
          Forgot password?
        </StyledLink>
      </StyledForm>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: "1.5rem",
        }}
      >
        <Typography
          sx={{ fontSize: "18px", color: "#969AB8", fontWeight: 650 }}
          variant="body2"
        >
          Don't have an account?
        </Typography>
        <StyledSignUpLink
          onClick={handleSignUpClick}
          variant="body2"
          sx={{ marginTop: "0.3rem" }}
        >
          Sign Up
        </StyledSignUpLink>
      </Box>
      <ToastContainer />
    </StyledContainer>
  );
};

export default LoginPage;
