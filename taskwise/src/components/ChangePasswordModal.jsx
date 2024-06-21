import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import Joi from "joi";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 300,
  bgcolor: "background.paper",
  border: "2px none #000",
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
};

const ChangePasswordModal = ({
  handleClose,
  onUpdatePasswordSuccess,
  onUpdatePasswordError,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const user = useSelector((state) => state.user.loggedInUser._id);

  const schema = Joi.object({
    currentPassword: Joi.string().required().messages({
      "string.empty": "Current password is required",
    }),
    newPassword: Joi.string()
      .pattern(
        new RegExp(
          "^[a-zA-Z0-9!@#\\$%\\^&\\*\\(\\)_\\+\\-=[\\]{};:'\",<>\\.\\?/`~]{7,}$"
        )
      )
      .required()
      .messages({
        "string.empty": "New password is required",
        "string.pattern.base":
          "New password must be at least 7 characters and contain only letters, numbers, and special characters",
      }),
    confirmPassword: Joi.any()
      .valid(Joi.ref("newPassword"))
      .required()
      .messages({
        "any.only": "Passwords do not match",
      }),
  });

  const handleSubmit = async () => {
    const { error } = schema.validate(formData, { abortEarly: false });

    if (error) {
      const validationErrors = {};
      error.details.forEach((detail) => {
        validationErrors[detail.path[0]] = detail.message;
      });
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsButtonDisabled(true);
    setLoading(true);

    const apiUrl =
      process.env.NODE_ENV === "production"
        ? "https://taskwise-backend-abhishek.onrender.com/api/auth/changepassword"
        : "http://localhost:8080/api/auth/changepassword";

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", //Ensure cookies are sent with the request
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          user: user,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        onUpdatePasswordError(data.message);
      } else {
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        onUpdatePasswordSuccess(data.message);
        handleClose();
      }
    } catch (error) {
      console.error("Error changing password:", error.message);
      onUpdatePasswordError(
        "An unexpected error occurred. Please try again later."
      );
    }
  };

  useEffect(() => {
    const toastId = toast.onChange((payload) => {
      if (payload.status === "removed") {
        setIsButtonDisabled(false);
        setLoading(false);
      }
    });
    return () => {
      toast.dismiss(toastId);
    };
  }, []);

  return (
    <Box sx={style}>
      <IconButton
        sx={{ position: "absolute", top: 8, right: 8 }}
        onClick={handleClose}
      >
        <CloseIcon />
      </IconButton>

      <TextField
        label="Enter current password"
        variant="outlined"
        type="password"
        name="currentPassword"
        fullWidth
        margin="normal"
        value={formData.currentPassword}
        onChange={handleChange}
        error={!!errors.currentPassword}
        helperText={errors.currentPassword}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Enter new password"
        variant="outlined"
        type={showPassword ? "text" : "password"}
        name="newPassword"
        fullWidth
        margin="normal"
        value={formData.newPassword}
        onChange={handleChange}
        InputProps={{
          endAdornment: (
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => setShowPassword(!showPassword)}
              edge="end"
            >
              {showPassword ? (
                <VisibilityOff fontSize="small" />
              ) : (
                <Visibility fontSize="small" />
              )}
            </IconButton>
          ),
        }}
        error={!!errors.newPassword}
        helperText={errors.newPassword}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Confirm new password"
        variant="outlined"
        type={showConfirmPassword ? "text" : "password"}
        name="confirmPassword"
        fullWidth
        margin="normal"
        value={formData.confirmPassword}
        onChange={handleChange}
        InputProps={{
          endAdornment: (
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              edge="end"
            >
              {showConfirmPassword ? (
                <VisibilityOff fontSize="small" />
              ) : (
                <Visibility fontSize="small" />
              )}
            </IconButton>
          ),
        }}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        onClick={handleSubmit}
        sx={{
          mt: 2,
          backgroundColor: "#0b5fae",
          ":hover": { backgroundColor: "#0a54a0" },
        }}
        disabled={isButtonDisabled}
        fullWidth
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Update Password"
        )}
      </Button>
    </Box>
  );
};

ChangePasswordModal.propTypes = {
  handleClose: PropTypes.func.isRequired,
  onUpdatePasswordSuccess: PropTypes.func.isRequired,
  onUpdatePasswordError: PropTypes.func.isRequired, // Callback for password update
};

export default ChangePasswordModal;
