import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import exclamationCircle from "assets/svg/exclamation-circle.svg";
import { CreateAssessmentInterface } from "_utils/interface";
import { CreateAssessmentCardProps } from "_utils/interface";

function CreateAssessmentCard(props: CreateAssessmentCardProps) {
  const { onClose } = props;
  const [IsTimed, setIsTimed] = useState(false);
  const [title, setTitle] = useState("");
  const [testId, setTestId] = useState("");
  const [description, setDescription] = useState("");
  const [passingPercentage, setPassingPercentage] = useState("");
  const [maxViolation, setMaxViolation] = useState("");

  const navigate = useNavigate();

  console.log("Component rendering"); // Check if the component renders

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission started");

    const assessmentDetails: CreateAssessmentInterface = {
      test_id: testId,
      title,
      description,
      language: "",
      passing_marks: parseInt(passingPercentage),
      total_marks: 0,
      timed_assessments: IsTimed,
      duration: "0",
      max_violations: parseInt(maxViolation),
      proctored: false,
      show_result: null,
    };

    console.log("Assessment details:", assessmentDetails);

    try {
      navigate(`/create-assessment/${testId}`, {
        state: { assessmentDetails },
      });
    } catch (error) {
      console.error("There was an error creating the assessment!", error);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-[10000]">
      <Card
        sx={{
          display: "flex",
          position: "absolute",
          top: "10vh",
          // margin: "auto",
          marginX: "20px",
          zIndex: 10,
          backgroundColor: "#FFFFFF",
          boxShadow:
            "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
          width: { md: "398px", xs: "90%" },
          height: "500px",
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ width: "100%" }}>
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center mb-4 w-full">
              <TextField
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter Assessment Title"
                variant="standard"
                InputProps={{
                  sx: {
                    fontSize: "20px",
                    lineHeight: "24px",
                    fontWeight: "600",
                    color: title ? "#001F68" : "#87B8FF",
                    "&::placeholder": {
                      color: "#87B8FF",
                      opacity: 1,
                    },
                    borderBottom: "1px solid #D7E8FF",
                    "&:before": {
                      borderBottom: "1px solid #D7E8FF",
                    },
                    "&:hover:not(.Mui-disabled):before": {
                      borderBottom: "1px solid #D7E8FF",
                    },
                    "&:after": {
                      borderBottom: "2px solid #001F68",
                    },
                  },
                }}
              />
              <CloseIcon onClick={onClose} className="cursor-pointer" />
            </div>
            <div className="flex items-center mb-[-1.5vh]">
              <Typography
                variant="body2"
                sx={{
                  fontSize: "10px",
                  fontWeight: "400",
                }}
                className="mr-2"
              >
                Test Id: <span style={{ color: "red" }}>*</span>
              </Typography>
            </div>
            <TextField
              fullWidth
              margin="normal"
              value={testId}
              onChange={(e) => setTestId(e.target.value)}
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#D7E8FF",
                  },
                },
              }}
              size="small"
            />
            <div className="flex items-center mt-[2vh] mb-[-1.5vh]">
              <Typography
                variant="body2"
                sx={{
                  fontSize: "10px",
                  fontWeight: "400",
                }}
                className="mr-2"
              >
                Description:<span style={{ color: "red" }}>*</span>
              </Typography>
            </div>
            <TextField
              fullWidth
              margin="normal"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#D7E8FF",
                  },
                },
              }}
            />
            <div className="flex items-center mb-[-1.5vh]">
              <Typography
                variant="body2"
                sx={{
                  fontSize: "10px",
                  fontWeight: "400",
                }}
                className="mr-2"
              >
                Passing Percentage:<span style={{ color: "red" }}>*</span>
              </Typography>
            </div>
            <TextField
              fullWidth
              margin="normal"
              type="number"
              value={passingPercentage}
              onChange={(e) => setPassingPercentage(e.target.value)}
              required
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#D7E8FF",
                  },
                },
              }}
            />
            <div className="flex items-center mb-[-1.5vh]">
              <Typography
                variant="body2"
                sx={{
                  fontSize: "10px",
                  fontWeight: "400",
                }}
                className="mr-2"
              >
                Max Violation:<span style={{ color: "red" }}>*</span>
              </Typography>
              <img src={exclamationCircle} className="ml-1" alt="" />
            </div>
            <TextField
              fullWidth
              margin="normal"
              type="number"
              value={maxViolation}
              onChange={(e) => setMaxViolation(e.target.value)}
              required
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#D7E8FF",
                  },
                },
              }}
            />
            <div className="flex items-center">
              <Grid container alignItems="center">
                <Grid item xs display="flex">
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "10px",
                      fontWeight: "400",
                    }}
                  >
                    Do you want the sections to be timed?
                    <span className="text-red-500">*</span>
                  </Typography>
                  <img src={exclamationCircle} className="ml-1" alt="" />
                </Grid>
                <Grid item>
                  <Switch
                    checked={IsTimed}
                    onChange={(e) => setIsTimed(e.target.checked)}
                    color="primary"
                  />
                </Grid>
              </Grid>
            </div>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              className="mt-4 bg-blue-500 hover:bg-blue-600"
            >
              Create Assessment
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateAssessmentCard;
