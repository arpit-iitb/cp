import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import back from "assets/svg/prev-black.svg";
import { useNavigate } from "react-router-dom";
import axiosHttp from "_utils/axios.index";
import { ApiConstants } from "_utils/api-constants";
import { QuestionsforCreateSection } from "_utils/interface";

function CreateSetCard(props: { onClose: () => void; set_type: string }) {
  const navigate = useNavigate();
  const [setName, setSetName] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [allProblems, setAllProblems] = useState<QuestionsforCreateSection[]>(
    []
  );
  const [visibleProblems, setVisibleProblems] = useState<
    QuestionsforCreateSection[]
  >([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(22);

  const fetchProblems = async () => {
    try {
      const [problemsRes, singleMcqsRes, multiMcqsRes, subjectiveQuesRes] =
        await Promise.all([
          axiosHttp.get(ApiConstants.assessment.getallproblems()),
          axiosHttp.get(ApiConstants.assessment.getallsinglemcqs()),
          axiosHttp.get(ApiConstants.assessment.getallmultimcqs()),
          axiosHttp.get(ApiConstants.assessment.getallsubjectiveques()),
        ]);

      const allProblemsData = [
        ...problemsRes.data,
        ...singleMcqsRes.data,
        ...multiMcqsRes.data,
        ...subjectiveQuesRes.data,
      ];

      setAllProblems(allProblemsData);
      setVisibleProblems(allProblemsData.slice(0, visibleCount));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleScroll = useCallback(() => {
    const dropdown = document.getElementById("scrollable-dropdown");
    if (dropdown) {
      const { scrollTop, scrollHeight, clientHeight } = dropdown;
      if (scrollHeight - scrollTop <= clientHeight + 50) {
        setVisibleCount((prevCount) => prevCount + 20);
      }
    }
  }, []);

  useEffect(() => {
    setVisibleProblems(allProblems.slice(0, visibleCount));
  }, [visibleCount, allProblems]);

  useEffect(() => {
    const dropdown = document.getElementById("scrollable-dropdown");
    if (dropdown) {
      dropdown.addEventListener("scroll", handleScroll);
      return () => dropdown.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const handleCreateSet = () => {
    props.onClose();
    return;
  };

  const textFieldStyle = {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#D7E8FF",
      },
      "&:hover fieldset": {
        borderColor: "#D7E8FF",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#D7E8FF",
      },
    },
    "& .MuiInputLabel-root": {
      color: "black",
      fontSize: "14px",
      transform: "translate(0, -24px) scale(1)",
    },
    "& .MuiInputBase-input::placeholder": {
      color: "#D7E8FF",
    },
  };

  const customTextFieldStyle = {
    "& .MuiInputBase-root": {
      borderColor: "#D7E8FF",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#D7E8FF",
      },
      "&:hover fieldset": {
        borderColor: "#87B8FF",
      },
    },
    "& .MuiInputLabel-root": {
      color: "#001F68",
    },
    "& .MuiInputBase-input": {
      color: "#001F68",
    },
  };

  const isStepComplete = () => {
    return setName !== "" && questions.length > 0;
  };

  return (
    <Card className="md:w-[420px] w-[90%] h-2/3 rounded-2xl flex flex-col absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 p-6">
      <div className="flex justify-between items-center mb-8">
        <div
          className="flex items-center cursor-pointer"
          onClick={props.onClose}
        >
          <span className="h-full">
            <img src={back} className="mr-2 h-4" alt="" />
          </span>
          <span className="text-secondary-500 text-sm">
            Back to Create Section
          </span>
        </div>
        <CloseIcon onClick={props.onClose} className="cursor-pointer" />
      </div>
      <div className="flex justify-between flex-row mb-6">
        <Typography variant="h6" sx={{ color: "#001F68", fontWeight: "600" }}>
          Create Set
        </Typography>
        <Button
          disabled
          variant="outlined"
          style={{
            backgroundColor: "#D7E8FF",
            borderColor: "#87B8FF",
            color: "black",
            borderRadius: "1rem",
            padding: "2px 12px",
            fontSize: "0.75rem",
            textTransform: "none",
          }}
        >
          Coding
        </Button>
      </div>

      <div className="flex-grow">
        <Typography variant="body2">
          Set name <span className="text-red-500">*</span>
        </Typography>
        <TextField
          fullWidth
          placeholder="Enter set title"
          value={setName}
          onChange={(e) => setSetName(e.target.value)}
          required
          sx={{ ...customTextFieldStyle, marginBottom: "16px" }}
        />

        <Typography variant="body2">
          Choose the questions <span className="text-red-500">*</span>
        </Typography>
        <FormControl fullWidth margin="normal" sx={textFieldStyle}>
          <Select
            multiple
            value={questions}
            onChange={(e) => setQuestions(e.target.value as string[])}
            renderValue={(selected) => (
              <div className="flex flex-wrap gap-1">
                {selected.map((value) => {
                  const problem = allProblems.find((p) => p.pk === value);
                  return (
                    <Chip
                      key={value}
                      label={problem ? problem.title : value}
                      onDelete={() => {
                        setQuestions(questions.filter((q) => q !== value));
                      }}
                      sx={{
                        backgroundColor: "#E6F0FF",
                        color: "#3183FF",
                        borderRadius: "16px",
                        height: "24px",
                        "& .MuiChip-label": {
                          padding: "0 8px",
                        },
                        "& .MuiChip-deleteIcon": {
                          color: "#3183FF",
                          fontSize: "18px",
                        },
                      }}
                    />
                  );
                })}
              </div>
            )}
            displayEmpty
            placeholder="Select all the sets you want"
            MenuProps={{
              PaperProps: {
                id: "scrollable-dropdown",
                style: {
                  maxHeight: 48 * 4.5 + 8,
                  // width: "100%",
                  maxWidth: "200px", // Adjust this value as needed to fit your design
                  // overflow: "auto",
                },
              },
            }}
            open={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            onOpen={() => setIsDropdownOpen(true)}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#D7E8FF",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#87B8FF",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#3183FF",
              },
              "& .MuiSelect-select": {
                display: "flex",
                flexWrap: "wrap",
              },
            }}
          >
            {visibleProblems.map((problem) => (
              <MenuItem
                key={problem.pk}
                value={problem.pk}
                sx={{ height: "25px", marginBottom: "4px" }}
              >
                <Checkbox checked={questions.indexOf(problem.pk) > -1} />
                <Typography>{problem.title}</Typography>
              </MenuItem>
            ))}
            <MenuItem
              sx={{
                position: "sticky",
                bottom: 0,
                backgroundColor: "white",
                borderTop: "1px solid #ccc",
                display: "flex",
                justifyContent: "space-between",
                zIndex: 1,
                padding: "8px",
                "&:hover": {
                  backgroundColor: "white",
                  opacity: 1,
                },
              }}
            >
              <Button
                variant="outlined"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(false);
                }}
                sx={{
                  width: "48%",
                }}
              >
                Okay
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuestions([]);
                  setIsDropdownOpen(false);
                }}
                sx={{
                  width: "48%",
                }}
              >
                Cancel
              </Button>
            </MenuItem>
          </Select>
        </FormControl>
      </div>

      <Button
        variant="contained"
        fullWidth
        style={{
          backgroundColor: isStepComplete() ? "#3183FF" : "#AFD0FF",
          color: "white",
          cursor: isStepComplete() ? "pointer" : "not-allowed",
          width: "100%",
          boxShadow: "none",
          margin: "4px 0 0 0",
        }}
        onClick={handleCreateSet}
      >
        Create Set
      </Button>
    </Card>
  );
}

export default CreateSetCard;
