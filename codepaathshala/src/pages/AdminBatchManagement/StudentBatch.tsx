import React, { useEffect, useState } from "react";
import { Button, Drawer, Stack } from "@mui/material";
import Divider from "@mui/material/Divider";
import DataTable from "components/DataTable";
import { GridColDef } from "@mui/x-data-grid";
import { UserPermissions } from "../../_utils/enum";
import SidePanel from "components/SidePanel";
import MultiSelect from "components/MultiSelect";
import axiosHttp from "../../_utils/axios.index";
import { ApiConstants } from "../../_utils/api-constants";
import { AxiosResponse } from "axios";
import { User } from "../../_utils/interface";
import CJDialog from "components/CJDialog";
import AddUserAdminForm from "components/Form/AddUserAdmin";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import AdminDashboard from "pages/AdminDashboard";
import Spinner from "components/Spinner";
import BulkImportCsv from "components/Form/BulkImportCsv";

export default function BatchStudentManagement() {
  const [tableData, setTableData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User>();
  const [batch, setBatch] = useState<{ label: string; value: string }[]>([]);
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [openDashboardDrawer, setOpenDashboardDrawer] =
    useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openBulkDialog, setOpenBulkDialog] = useState<boolean>(false);

  const [dialogData, setDialogData] = useState<{
    title: string;
    action: "ADD" | "DELETE";
  }>();
  const toggleDrawer = (newOpen: boolean) => () => {
    if (!newOpen) setSelectedUser(undefined);
    setOpenDrawer(newOpen);
  };
  const toggleDashboardDrawer = (newOpen: boolean) => () => {
    setOpenDashboardDrawer(newOpen);
  };
  useEffect(() => {
    axiosHttp
      .get(ApiConstants.admin.batchList())
      .then((res: AxiosResponse) => {
        if (res.data as { id: number; name: string }[]) {
          let data: { label: string; value: string }[] = [];
          res.data.forEach((single: { id: number; name: string }) => {
            data.push({ label: single.name, value: single.name });
          });
          setBatch(data);
        }
      })
      .catch((err: Error) => {
        throw new Error(err.message);
      });
  }, []);
  const [columnDefs] = useState<GridColDef[]>([
    {
      field: "username",
      headerName: "Username",
      type: "string",
      sortable: false,
      align: "left",
      filterable: true,
      headerAlign: "left",
      disableColumnMenu: true,
    },
    {
      field: "email",
      headerName: "Email",
      sortable: false,
      align: "center",
      filterable: true,
      headerAlign: "center",
      disableColumnMenu: true,
    },
    {
      field: "name",
      headerName: "Name",
      sortable: false,
      align: "center",
      filterable: true,
      headerAlign: "center",
      disableColumnMenu: true,
    },
    {
      field: "phone_number",
      headerName: "Phone Number",
      sortable: false,
      align: "center",
      filterable: false,
      headerAlign: "center",
      disableColumnMenu: true,
    },
    {
      field: "problems_solved",
      headerName: "Problems Solved",
      sortable: false,
      align: "center",
      filterable: false,
      headerAlign: "center",
      disableColumnMenu: true,
    },
    {
      field: "videos_watched",
      headerName: "Videos Watched",
      sortable: false,
      align: "center",
      filterable: false,
      headerAlign: "center",
      disableColumnMenu: true,
    },
    {
      field: "assignments_solved",
      headerName: "Assignments Solved",
      sortable: false,
      align: "center",
      filterable: false,
      headerAlign: "center",
      disableColumnMenu: true,
    },
    {
      field: "mcqs_solved",
      headerName: "MCQ Solved",
      sortable: false,
      align: "center",
      filterable: false,
      headerAlign: "center",
      disableColumnMenu: true,
    },
    {
      field: "action",
      filterable: false,
      headerName: "Action",
      sortable: false,
      align: "right",
      headerAlign: "center",
      disableColumnMenu: true,
      renderCell: (params: any) => {
        const onClick = (type: "Edit" | "Delete" | "Student Stats") => {
          const currentRow = params.row as User;
          setSelectedUser(currentRow);
          switch (type) {
            case "Edit":
              setOpenDrawer(true);
              break;
            case "Student Stats":
              setOpenDashboardDrawer(true);
              break;
            case "Delete":
              setDialogData({ title: "Delete User", action: "DELETE" });
              setOpenDialog(true);
              break;
          }
        };

        return (
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              color="warning"
              size="small"
              onClick={() => onClick("Edit")}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => onClick("Student Stats")}
            >
              STATS
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => onClick("Delete")}
            >
              Delete
            </Button>
          </Stack>
        );
      },
    },
  ]);

  const addStudent = (ev: React.MouseEvent<HTMLButtonElement>) => {
    setDialogData({ title: "Add Student", action: "ADD" });
    setOpenDialog(true);
  };

  const addStudentsInBulk = (ev: React.MouseEvent<HTMLButtonElement>) => {
    setDialogData({ title: "Add Student In Bulk", action: "ADD" });
    setOpenBulkDialog(true);
  };
  const handleCloseDialog = (value: any) => {
    setOpenDialog(false);
  };
  const handleCloseBulkDialog = (value: any) => {
    setOpenBulkDialog(false);
  };
  const handleChange = (event: { label: string; value: string }[]) => {
    let selections: string[] = [];
    event.forEach((e) => {
      selections.push(`${e.value}`);
    });

    setSelectedBatches(selections);
  };

  const dialogActionHandler = () => {
    if (selectedUser && selectedUser?.username) {
      axiosHttp
        .delete(ApiConstants.admin.deleteUser(selectedUser?.username))
        .then((res: AxiosResponse) => {
          toast.success("User Deleted Successfully");
        })
        .catch((err: Error) => {
          toast.error(err.message);
          throw new Error(err.message);
        });
      setOpenDialog(false);
    }
  };

  function getStudentData() {
    let requestBatches: string[] = [];
    selectedBatches.forEach((single) => {
      requestBatches.push(`'${single}'`);
    });

    if (requestBatches.length === 0 || requestBatches[0] === "") return;
    setLoading(true);
    axiosHttp
      .get(ApiConstants.admin.batchUsers(requestBatches))
      .then((res: AxiosResponse) => {
        if (res?.data) {
          let data = [...res?.data] as User[];
          setTableData(data);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        throw new Error(err.message);
      });
  }

  return (
    <section className="min-h-[70svh] container text-[#222]">
      <div className="grid grid-cols-7 gap-3 items-center mb-4">
        <p className="col-span-2">
          Select the Batch to View Student Data for the specific batch
        </p>
        <div className="col-span-4">
          <MultiSelect
            multiple={true}
            options={batch}
            placeholder={"Choose Batch Name"}
            label={"Select Batch"}
            handleChange={handleChange}
          />
        </div>
        <Button
          variant="contained"
          disableElevation={true}
          className="col-span-1 w-full"
          onClick={() => getStudentData()}
        >
          Search
        </Button>
      </div>
      <Divider />
      <div className="mt-4">
        <div className="flex justify-end">
          <Button
            color="primary"
            onClick={addStudentsInBulk}
            variant="contained"
            className="!me-3"
            disableElevation={true}
          >
            Add Students in Bulk
          </Button>
          <Button
            color="primary"
            onClick={addStudent}
            variant="contained"
            disableElevation={true}
          >
            Add Student
          </Button>
        </div>
        {tableData?.length > 0 ? (
          <DataTable
            uniqueProperty={"username"}
            tableData={tableData}
            columnDefs={columnDefs}
            actions={[
              UserPermissions.ADD,
              UserPermissions.DELETE,
              UserPermissions.EDIT,
            ]}
          />
        ) : (
          <>
            {loading ? (
              <div className="flex justify-center">
                <Spinner />
              </div>
            ) : (
              <>
                <div className="flex justify-center">
                  No Batch Data Available
                </div>
              </>
            )}
          </>
        )}
      </div>

      <Drawer anchor={"right"} open={openDrawer} onClose={toggleDrawer(false)}>
        <div className="w-[90svw] md:w-[50svw]">
          {selectedUser ? (
            <SidePanel
              batchList={batch}
              user={selectedUser as Partial<User>}
            ></SidePanel>
          ) : null}
        </div>
      </Drawer>

      <Drawer
        anchor={"right"}
        open={openDashboardDrawer}
        onClose={toggleDashboardDrawer(false)}
        PaperProps={{
          sx: {
            width: "100%",
            height: "100%",
            maxWidth: "100%",
          },
        }}
      >
        <div className="w-full h-full p-3 relative">
          <Button
            onClick={toggleDashboardDrawer(false)}
            className="!ml-auto !flex !justify-end !bg-primary-500 !text-white !normal-case"
          >
            Close
          </Button>
          {selectedUser ? (
            <AdminDashboard
              studentDashboard={true}
              batch_Name={selectedBatches as any}
              userName={selectedUser?.username}
            />
          ) : null}
        </div>
      </Drawer>
      <CJDialog
        maxWidth={"lg"}
        title={dialogData?.title ?? ""}
        isOpen={openDialog}
        action={
          dialogData?.action === "DELETE"
            ? { actionText: "Delete", actionHandler: dialogActionHandler }
            : undefined
        }
        afterClosed={handleCloseDialog}
      >
        <br />
        {dialogData?.action === "DELETE" ? (
          <>Are you sure you want delete the Student?</>
        ) : (
          <AddUserAdminForm batchList={batch} />
        )}
      </CJDialog>

      <CJDialog
        maxWidth={"lg"}
        title={dialogData?.title ?? ""}
        isOpen={openBulkDialog}
        afterClosed={handleCloseBulkDialog}
      >
        <br />
        <BulkImportCsv batchList={batch} />
      </CJDialog>
    </section>
  );
}
