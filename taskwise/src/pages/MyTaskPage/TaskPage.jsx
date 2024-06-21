import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { styled } from "@mui/material/styles";
import { format } from "date-fns";
import FlagIcon from "@mui/icons-material/Flag";
import { fetchTasksByUserIDAsync } from "../../features/workspace/workspaceSlice";
import TaskModal from "../../components/TaskModal";
import Loading from "../../components/Loading";

// Register the necessary modules with AG Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

// Styled container for the AG Grid
const StyledAgGridContainer = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
  width: "100%",
}));

// Styled message for no tasks
const NoTasksMessage = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
  width: "100%",
  fontSize: "1.5rem",
  color: theme.palette.text.secondary,
}));

// Custom function to format date into a readable format
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return format(date, "dd MMM yy");
};

// Custom cell renderer for priority column
const priorityRenderer = (params) => {
  const priority = params.value;
  switch (priority) {
    case "High":
      return <FlagIcon style={{ color: "red" }} />;
    case "Medium":
      return <FlagIcon style={{ color: "yellow" }} />;
    case "Low":
      return <FlagIcon style={{ color: "green" }} />;
    default:
      return null;
  }
};

const TaskPage = () => {
  // eslint-disable-next-line
  const tasksData = useSelector((state) => state.workspace.userTasks) || [];
  const userId = useSelector((state) => state?.user?.loggedInUser?._id);
  const fetchTasksByUserIDStatus = useSelector(
    (state) => state.workspace.fetchTasksByUserIDStatus
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (userId) {
      dispatch(fetchTasksByUserIDAsync(userId));
    }
  }, [dispatch, userId]);

  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);

  // Set the row data using the provided tasksData
  const [rowData, setRowData] = useState(tasksData);

  useEffect(() => {
    setRowData(tasksData);
  }, [tasksData]);

  // Define the column definitions to match the structure of the tasks data
  const colDefs = useMemo(
    () => [
      {
        field: "name",
        headerName: "Task",
        flex: 1,
        sortable: true,
        filter: "agTextColumnFilter",
        cellStyle: { cursor: "pointer" }, // Set cursor pointer for Task column
      },
      {
        field: "dueDate",
        headerName: "Due Date",
        flex: 1,
        sortable: true,
        filter: "agTextColumnFilter",
        valueFormatter: (params) => formatDate(params.value), // Use a custom formatter function
        cellStyle: { cursor: "pointer" }, // Set cursor pointer for Task column
      },
      {
        field: "priority",
        headerName: "Priority",
        flex: 1,
        sortable: true,
        filter: "agTextColumnFilter",
        cellRenderer: "priorityRenderer", // Use a custom cell renderer for priority column
        cellStyle: { cursor: "pointer" }, // Set cursor pointer for Task column
      },
      {
        field: "project",
        headerName: "Project",
        flex: 1,
        sortable: true,
        filter: "agTextColumnFilter",
        cellStyle: { cursor: "pointer" }, // Set cursor pointer for Task column
      },
      {
        field: "workspace",
        headerName: "Workspace",
        flex: 1,
        sortable: true,
        filter: "agTextColumnFilter",
        cellStyle: { cursor: "pointer" }, // Set cursor pointer for Task column
      },
    ],
    []
  );

  // State to track selected task and modal visibility
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleTaskItemClick = useCallback((params) => {
    setSelectedTask(params.data);
    setModalOpen(true);
  }, []);

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedTask(null);
  };

  // Default column properties
  const defaultColDef = useMemo(
    () => ({
      filter: true,
      floatingFilter: true,
      resizable: true,
      minWidth: 100,
    }),
    []
  );

  // Show loading indicator while fetching tasks
  if (fetchTasksByUserIDStatus === "loading") {
    return (
      <StyledAgGridContainer>
        <div className="ag-theme-alpine" style={gridStyle}>
          <Loading />
        </div>
      </StyledAgGridContainer>
    );
  }

  return (
    <StyledAgGridContainer>
      {rowData && rowData.length > 0 ? (
        <div className="ag-theme-alpine" style={gridStyle}>
          <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            frameworkComponents={{ priorityRenderer }} // Register the custom cell renderer
            rowSelection="multiple"
            suppressRowClickSelection={true}
            onRowClicked={handleTaskItemClick} // Handle row click event
          />
        </div>
      ) : (
        <NoTasksMessage>
          There are no tasks on your list at this moment
        </NoTasksMessage>
      )}
      {/* Render the task detail modal */}
      {selectedTask && (
        <TaskModal
          open={modalOpen}
          handleClose={handleModalClose}
          task={selectedTask}
        />
      )}
    </StyledAgGridContainer>
  );
};

export default TaskPage;
