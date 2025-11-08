import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  StepIconProps,
  Chip,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CreateSetCard from "./CreateSetCard";
import axiosHttp from "_utils/axios.index";
import { ApiConstants } from "_utils/api-constants";
import { AxiosResponse } from "axios";
import {
  QuestionsforCreateSection,
  AssessmentSectionProps,
} from "_utils/interface";
import { steps } from "_utils/constants";

const CustomStepIcon = (props: StepIconProps) => {
  const { active, completed, icon } = props;
  const baseClass =
    "flex items-center justify-center w-[26px] h-[26px] rounded-full border-2";
  const activeClass = "border-primary-300 text-primary-300 bg-white";
  const completedClass = "border-primary-500 bg-primary-500 text-white";
  const className = `${baseClass} ${
    active
      ? activeClass
      : completed
      ? completedClass
      : "border-primary-300 text-primary-300 bg-white"
  }`;
  return <div className={className}>{icon}</div>;
};

function AssessmentSection(props: AssessmentSectionProps) {
  const { onClose, IsTimed, test_id } = props;
  const [activeStep, setActiveStep] = useState(0);
  const [sectionType, setSectionType] = useState("");
  const [title, setTitle] = useState("");
  const [numSets, setNumSets] = useState<number | string>("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [easyMarks, setEasyMarks] = useState("");
  const [mediumMarks, setMediumMarks] = useState("");
  const [hardMarks, setHardMarks] = useState("");
  const [hours, setHours] = useState<number | string>("");
  const [minutes, setMinutes] = useState<number | string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [totalMarks, setTotalMarks] = useState(0);
  const [showCreateSetCard, setShowCreateSetCard] = useState(false);
  const [allsets, setallsets] = useState<QuestionsforCreateSection[]>([]);

  const updateTotalMarks = (easy: string, medium: string, hard: string) => {
    const total = Number(easy) + Number(medium) + Number(hard);
    setTotalMarks(total);
  };

  const handleNext = () =>
    setActiveStep((prevActiveStep) => prevActiveStep + 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      test_id, // You might want to make this dynamic
      title: title,
      sections_type:
        sectionType === "Coding" ? "P" : sectionType === "MCQ" ? "M" : "A",
      set_count: Number(numSets),
      set_ids: questions,
      priority_order: 2, // You might want to make this dynamic
      section_cutoff: 0, // You might want to make this dynamic
      Total_marks: totalMarks,
      time_duration: IsTimed ? `${hours}*60 + ${minutes}` : "0", // Format as needed
      easy_question_marks: Number(easyMarks),
      medium_question_marks: Number(mediumMarks),
      hard_question_marks: Number(hardMarks),
    };

    console.log(payload);

    axiosHttp
      .post(`${ApiConstants.assessment.createSection()}`, payload)
      .then((response) => {
        console.log("Assessment item created successfully", response.data);
        navigate("/create-assessment");
        onClose();
      })
      .catch((error) => {
        console.error("Error creating assessment item", error);
        // Handle error (e.g., show error message to user)
      });
  };

  useEffect(() => {
    function getallsets() {
      axiosHttp
        .get(ApiConstants.assessment.getallsets(sectionType))
        .then((res: AxiosResponse) => {
          setallsets(res.data);
        })
        .catch((err) => {
          console.error(err);
        });
    }
    getallsets();
  }, [activeStep]);

  const isStepComplete = () => {
    switch (activeStep) {
      case 0:
        return sectionType !== "";
      case 1:
        return title !== "" && numSets !== "" && questions.length > 0;
      case 2:
        return easyMarks !== "" && mediumMarks !== "" && hardMarks !== "";
      default:
        return false;
    }
  };

  const continueButtonStyle = {
    backgroundColor: isStepComplete() ? "#3183FF" : "#AFD0FF",
    color: "white",
    cursor: isStepComplete() ? "pointer" : "not-allowed",
    width: "100%",
    boxShadow: "none",
    marginBottom: "-10px",
    padding: "8px",
    height: "30px",
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

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-[10]">
      <Card
        className="rounded-2xl flex flex-col"
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
          width: { md: "420px", xs: "90%" },
          minHeight: "524px",
          borderRadius: 2,
        }}
      >
        <CardContent className="flex flex-col flex-grow">
          <div className="flex justify-between items-center mb-4">
            <Typography
              variant="h6"
              className="text-[#001F68] font-semibold p-1"
            >
              Create new section
            </Typography>
            <CloseIcon onClick={onClose} className="cursor-pointer" />
          </div>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            className="border-b pb-3 mb-4"
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel StepIconComponent={CustomStepIcon}>
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-grow justify-between"
          >
            <div>
              {activeStep === 0 && (
                <div className="flex flex-col justify-start">
                  <Typography
                    variant="h6"
                    sx={{ color: "#001F68", fontWeight: "600" }}
                  >
                    Choose section type
                  </Typography>
                  <div className="flex w-full mt-4">
                    {["P", "M", "A"].map((type) => (
                      <Button
                        key={type}
                        variant="outlined"
                        style={{
                          backgroundColor:
                            sectionType === type ? "#D7E8FF" : "",
                          borderColor: sectionType === type ? "#87B8FF" : "",
                          color: "black",
                          marginRight: "4px",
                          borderRadius: "2rem",
                          marginTop: "4px",
                        }}
                        className="rounded-2xl mr-2 p-2 text-xs"
                        onClick={() => setSectionType(type)}
                      >
                        {type === "P"
                          ? "Coding"
                          : type === "M"
                          ? "MCQ"
                          : "Subjective"}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {activeStep === 1 && (
                <div>
                  <div className="flex justify-between mb-4">
                    <Typography
                      variant="h6"
                      sx={{ color: "#001F68", fontWeight: "600" }}
                    >
                      Section Details
                    </Typography>
                    <Button
                      disabled
                      variant="outlined"
                      style={{
                        backgroundColor: "#D7E8FF",
                        borderColor: "#87B8FF",
                        color: "black",
                        marginRight: "4px",
                        borderRadius: "2rem",
                        marginTop: "4px",
                      }}
                      className="rounded-2xl mr-2 p-2 text-xs"
                    >
                      {sectionType === "P"
                        ? "Coding"
                        : sectionType === "A"
                        ? "Subjective"
                        : "MCQ"}
                    </Button>
                  </div>
                  <Typography
                    sx={{
                      color: "black",
                      fontSize: "14px",
                    }}
                  >
                    Title <span>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    margin="normal"
                    placeholder="Enter section title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    sx={textFieldStyle}
                  />
                  {IsTimed && (
                    <div className="mt-4">
                      <Typography
                        sx={{
                          color: "black",
                          fontSize: "14px",
                          marginBottom: "8px",
                        }}
                      >
                        Set section timing{" "}
                        <span className="text-red-500">*</span>
                      </Typography>
                      <div className="flex space-x-4">
                        <TextField
                          placeholder="Enter in HH"
                          type="number"
                          value={hours}
                          onChange={(e) => {
                            const value = e.target.value;
                            setHours(value);
                          }}
                          sx={{
                            ...textFieldStyle,
                            width: "50%",
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                Hrs
                              </InputAdornment>
                            ),
                            inputProps: {
                              min: 0,
                              style: { textAlign: "left" },
                            },
                          }}
                        />
                        <TextField
                          placeholder="Enter in MM"
                          value={minutes}
                          onChange={(e) => {
                            const value = e.target.value;
                            setMinutes(value);
                          }}
                          sx={{
                            ...textFieldStyle,
                            width: "50%",
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                Mins
                              </InputAdornment>
                            ),
                            inputProps: {
                              min: 0,
                              style: { textAlign: "left" },
                            },
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <Typography
                    sx={{
                      color: "black",
                      fontSize: "14px",
                    }}
                  >
                    Number of sets <span className="text-red-500">*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter number of sets"
                    type="number"
                    value={numSets}
                    onChange={(e) => setNumSets(e.target.value)}
                    required
                    sx={{
                      ...textFieldStyle,
                      "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                        {
                          "-webkit-appearance": "none",
                          margin: 0,
                        },
                      marginTop: "6px",
                    }}
                    InputProps={{
                      inputProps: { min: 1 },
                    }}
                  />
                  <FormControl fullWidth margin="normal" sx={textFieldStyle}>
                    <Typography
                      sx={{
                        color: "black",
                        fontSize: "14px",
                        marginBottom: "8px",
                      }}
                    >
                      Choose the question sets{" "}
                      <span className="text-red-500">*</span>
                    </Typography>
                    <Select
                      multiple
                      value={questions}
                      onChange={(e) => {
                        const value = e.target.value;
                        setQuestions(
                          typeof value === "string" ? value.split(",") : value
                        );
                      }}
                      renderValue={(selected) => (
                        <div className="flex flex-wrap gap-1">
                          {selected.map((value) => {
                            const selectedItem = allsets.find(
                              (item) => item.pk === value
                            );
                            return (
                              <Chip
                                key={value}
                                label={
                                  selectedItem ? selectedItem.title : value
                                }
                                onDelete={() => {
                                  setQuestions(
                                    questions.filter((q) => q !== value)
                                  );
                                }}
                                sx={{
                                  backgroundColor: "#E6F0FF",
                                  color: "#3183FF",
                                  borderRadius: "0px",
                                  border: "1px solid #AFD0FF",
                                  height: "32px",
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
                          style: {
                            maxHeight: 48 * 4.5 + 8,
                            width: 250,
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
                      }}
                    >
                      <MenuItem
                        value=""
                        sx={{ marginBottom: "8px", zIndex: "10001" }}
                        onClick={() => {
                          setShowCreateSetCard(true);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <span className="text-[#3183FF]">+ Create new set</span>
                      </MenuItem>
                      {allsets.map((problem) => (
                        <MenuItem
                          key={problem.pk}
                          value={problem.pk}
                          sx={{
                            height: "25px",
                            marginBottom: "4px",
                            zIndex: "10001",
                          }}
                        >
                          <Checkbox
                            checked={questions.indexOf(problem.pk) > -1}
                          />
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
                          zIndex: 10002,
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

                  {/* <div className="flex items-center mt-4">
                  <Typography className="mr-2">Timed Section</Typography>
                  <Switch
                    checked={timed}
                    onChange={(e) => setTimed(e.target.checked)}
                  />
                </div> */}
                </div>
              )}
              {activeStep === 2 && (
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <Typography
                      variant="h6"
                      sx={{ color: "#001F68", fontWeight: "600" }}
                    >
                      Section Marks
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
                      {sectionType}
                    </Button>
                  </div>
                  <div className="flex justify-between space-x-4 border-b pb-2 mb-2">
                    <div className="flex-1">
                      <Typography
                        variant="body2"
                        sx={{ color: "#001F68", marginBottom: "4px" }}
                      >
                        Easy Level <span className="text-red-500">*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        type="number"
                        value={easyMarks}
                        onChange={(e) => {
                          setEasyMarks(e.target.value);
                          updateTotalMarks(
                            e.target.value,
                            mediumMarks,
                            hardMarks
                          );
                        }}
                        required
                        sx={{
                          ...customTextFieldStyle,
                          "& .MuiOutlinedInput-root": {
                            height: "40px",
                          },
                        }}
                        InputProps={{
                          inputProps: { min: 0 },
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <Typography
                        variant="body2"
                        sx={{ color: "#001F68", marginBottom: "4px" }}
                      >
                        Medium Level <span className="text-red-500">*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        type="number"
                        value={mediumMarks}
                        onChange={(e) => {
                          setMediumMarks(e.target.value);
                          updateTotalMarks(
                            easyMarks,
                            e.target.value,
                            hardMarks
                          );
                        }}
                        required
                        sx={{
                          ...customTextFieldStyle,
                          "& .MuiOutlinedInput-root": {
                            height: "40px",
                          },
                        }}
                        InputProps={{
                          inputProps: { min: 0 },
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <Typography
                        variant="body2"
                        sx={{ color: "#001F68", marginBottom: "4px" }}
                      >
                        Hard Level <span className="text-red-500">*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        type="number"
                        value={hardMarks}
                        onChange={(e) => {
                          setHardMarks(e.target.value);
                          updateTotalMarks(
                            easyMarks,
                            mediumMarks,
                            e.target.value
                          );
                        }}
                        required
                        sx={{
                          ...customTextFieldStyle,
                          "& .MuiOutlinedInput-root": {
                            height: "40px",
                          },
                        }}
                        InputProps={{
                          inputProps: { min: 0 },
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end items-center mt-2">
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#001F68",
                        fontWeight: "600",
                        marginRight: "8px",
                      }}
                    >
                      Total Section Marks
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ color: "#001F68", fontWeight: "600" }}
                    >
                      {totalMarks}
                    </Typography>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4">
              <Button
                type="button"
                variant="contained"
                style={{
                  ...continueButtonStyle,
                  textTransform: "none",
                }}
                onClick={activeStep !== 2 ? handleNext : handleSubmit}
              >
                {activeStep === 2 ? "Create Assessment" : "Continue"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {showCreateSetCard && (
        <CreateSetCard
          onClose={() => setShowCreateSetCard(false)}
          set_type={
            sectionType === "Coding" ? "P" : sectionType === "MCQ" ? "M" : "A"
          }
        />
      )}
    </div>

    //Temporary comments before finalising responsiveness
  );
}

export default AssessmentSection;
