import { DialogActions, DialogContent, Button } from "@mui/material";
import { ApiConstants } from "_utils/api-constants";
import axiosHttp from "_utils/axios.index";
import { Axios, AxiosResponse } from "axios";
import MultiSelect from "components/MultiSelect";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function BulkImportCsv({
  batchList,
}: {
  batchList: { label: string; value: string }[];
}) {
  const [batches, setBatches] = useState<string>("");
  const handleExportSample = async () => {
    try {
      // Sample data with empty values
      const headers = [
        "name",
        "username",
        "email",
        "phone",
        "password",
        "confirm_password",
        "college_name",
      ];
      const rows = [
        ["", "", "", "", "", "", ""], // Empty row for CSV
      ];

      // Create CSV content
      const csvContent = [
        headers.join(","), // Header row
        ...rows.map((row) => row.join(",")), // Data rows
      ].join("\n");

      // Create a Blob from the CSV content
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sample.csv"; // Set file name for the download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Log the data for debugging
    } catch (error) {
      toast.error("Error exporting sample.");
    }
  };

  const handleSelectChange = (event: { label: string; value: string }[]) => {
    let batches: string[] = [];
    event.forEach((e) => {
      batches.push(`${e.value}`);
    });
    setBatches(batches[0]);
  };

  const handleUploadStudentData = async (file: File, batchName: any) => {
    if (!batchName) {
      toast.error(
        "Please select a batch to proceed with the student data upload."
      );
      return;
    }
    // Create FormData to send the file
    const formData = new FormData();
    formData.append("file", file);

    // Read the CSV file content
    const reader = new FileReader();
    reader.onload = () => {
      const fileContent = reader.result as string;
      // Split content by lines and parse headers
      const lines = fileContent.split("\n");
      const headers = lines[0].split(",").map((header) => header.trim());
      // Ensure headers are correct
      const expectedHeaders = [
        "name",
        "username",
        "email",
        "phone",
        "password",
        "confirm_password",
        "college_name",
      ];

      const isValid = expectedHeaders.every(
        (header, index) => header === headers[index]
      );
      if (!isValid) {
        toast.error(
          "The CSV file is not proper. Please use the provided sample."
        );
        return;
      }

      // Extract college_name from the first row (or adjust logic based on CSV structure)
      const collegeName = lines[1].split(",")[6].trim(); // Assuming college_name is the 6th column
      // Parse student data
      const students = lines
        .slice(1)
        .filter((line) => line.trim() !== "") // Remove empty lines
        .map((line) => {
          const values = line.split(",").map((value) => value.trim());
          return {
            name: values[0],
            username: values[1],
            email: values[2],
            phone: values[3],
            password: values[4],
            confirm_password: values[5],
          };
        });
      // Check for any empty fields in the rows
      const invalidRows = students.filter(
        (student) =>
          !student.name ||
          !student.username ||
          !student.email ||
          !student.phone ||
          !student.password
      );

      if (invalidRows.length > 0) {
        toast.error("Some fields are empty. Please fill all fields.");
        return;
      }

      // Prepare the request payload
      const requestData = {
        students,
        batch_name: batchName,
        college_name: collegeName,
      };

      // Send data to server
      axiosHttp
        .post(ApiConstants.admin.createBulkStudent(), requestData, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res: AxiosResponse) => {
          toast.success("Students account created successfully.");
        })
        .catch((err: any) => {
          toast.error(
            err?.response?.data?.message ||
              "Error uploading file Please check once again."
          );
        });

      // Show success message after upload
    };

    // Read the file as text
    reader.readAsText(file);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type !== "text/csv") {
        toast.error("Please upload a CSV file");
        return;
      }

      // Read the file content as text
      handleUploadStudentData(file, batches);
    }
  };

  return (
    <div>
      <DialogContent></DialogContent>
      <div className="col-span-2">
        <MultiSelect
          multiple={true}
          options={batchList}
          placeholder={"Choose Batch Name"}
          label={"Select Batch"}
          handleChange={handleSelectChange}
        />
      </div>
      <DialogActions>
        <Button
          onClick={handleExportSample}
          color="primary"
          variant="contained"
          style={{ marginRight: "10px" }}
        >
          Export Sample
        </Button>
        <Button
          onClick={() => document.getElementById("csv-upload")?.click()}
          color="primary"
          variant="contained"
        >
          Upload Student Data
        </Button>
        <input
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          id="csv-upload"
          onChange={handleFileChange}
        />
      </DialogActions>

      <ToastContainer />
    </div>
  );
}

export default BulkImportCsv;
