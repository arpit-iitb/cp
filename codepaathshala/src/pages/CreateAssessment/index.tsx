import React, { useState, useEffect } from "react";
import { Typography, Button, Box, Container } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import back from "assets/svg/Back.svg";
import computer from "assets/svg/Computer.svg";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AssessmentSectionInterface } from "_utils/interface";
import SortableItem from "components/DND-Context";
import SaveCard from "components/cards/CreateAssessmentSections/save";
import AssessmentSection from "components/cards/CreateAssessmentSections/AssessmentSection";
import DeleteCard from "components/cards/CreateAssessmentSections/delete";
import axiosHttp from "_utils/axios.index";
import { AxiosResponse } from "axios";
import TimeCard from "components/cards/CreateAssessmentSections/timelimit";
import { ApiConstants } from "_utils/api-constants";
import { useParams } from "react-router-dom";
import { CreateAssessmentInterface } from "_utils/interface";

export default function CreateAssessment() {
  const location = useLocation();
  const { id: testId } = useParams<{ id: string }>();
  const { title: titleparam } = useParams<{ title: string }>();
  const { istimed: Istimed } = useParams<{ istimed: string }>();

  console.info("location", location);

  useEffect(() => {
    function getAssessments() {
      axiosHttp
        .get(`${ApiConstants.assessment.getAssessmentSections(testId)}`)
        .then((res: AxiosResponse) => {
          setSectionData(res.data);
        })
        .catch((err) => {
          console.error(err);
        });
    }

    getAssessments();
  }, []);

  const handleSubmitandDuration = (duration: string) => {
    setDuration(duration);
    handleSubmit();
  };

  const handleSubmit = async () => {
    // e.preventDefault();
    console.log("Form submission started");

    const assessmentDetails: CreateAssessmentInterface = {
      test_id: location.state.assessmentDetails.test_id,
      title: location.state.assessmentDetails.title,
      description: location.state.assessmentDetails.description,
      language: "",
      passing_marks: location.state.assessmentDetails.passing_marks,
      total_marks: sectionTotal,
      timed_assessments: location.state.assessmentDetails.timed_assessments,
      duration: duration,
      max_violations: location.state.assessmentDetails.max_violations,
      proctored: false,
      show_result: null,
    };

    console.log("Assessment details:", assessmentDetails);

    try {
      const response = await axiosHttp.post(
        // ApiConstants.assessment.createAssessment(),
        "https://be.codepaathshala.com/api/assessment_V2/create-assessment/",
        assessmentDetails
      );
      console.log("API response:", response);
      // navigate(`/create-assessment/${testId}/${title}/${IsTimed}`, {
      //   state: { assessmentDetails },
      // });
    } catch (error) {
      console.error("There was an error creating the assessment!", error);
      // navigate(`/create-assessment/${title}`);
    }
    // navigate(`/create-assessment/${testId}/${title}/${IsTimed}`);
  };

  // ... (rest of the state and functions remain the same)
  const [showTimeCard, setShowTimeCard] = useState(false);
  const [showSectionCard, setShowSectionCard] = useState(false);
  const openCard = () => {
    setShowSectionCard(true);
  };
  const closeCard = () => {
    setShowSectionCard(false);
  };
  const openTimeCard = () => {
    setShowTimeCard(true);
  };

  const closeTimeCard = () => {
    setShowTimeCard(false);
  };

  const initialSectionData: AssessmentSectionInterface[] = [
    {
      title: "Coding Problems",
      sections_type: "Coding",
      section_cutoff: 35,
      Total_marks: 40,
    },
    // {
    //   title: "Apptitude MCQ",
    //   type: "MCQ",
    //   total_marks: 15,
    //   percentage: 35,
    // },
    // {
    //   title: "Technical MCQ",
    //   type: "MCQ",
    //   total_marks: 20,
    //   percentage: 35,
    // },
    // {
    //   title: "Subjective Assignment",
    //   type: "Subjective",
    //   total_marks: 25,
    //   percentage: 35,
    // },
  ];

  const [sectionData, setSectionData] = useState(initialSectionData);
  const [passing_marks, setpassing_marks] = useState(0);
  const [data, setData] = useState(true);
  const [sectionTotal, setsectionTotal] = useState(0);
  const [deletecard, setdeletecard] = useState(false);
  const [duration, setDuration] = useState<string>("");

  const opendeletecard = () => {
    setdeletecard(true);
  };
  const closedeletecard = () => {
    setdeletecard(false);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSectionData((items) => {
        const oldIndex = items.findIndex((item) => item.title === active.id);
        const newIndex = items.findIndex((item) => item.title === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  const navigate = useNavigate();
  console.log("passing marks", passing_marks);

  useEffect(() => {
    const totalMarks = sectionData.reduce(
      (total, section) => total + section.Total_marks,
      0
    );
    const passingMarks = sectionData.reduce(
      (total, section) =>
        total + (section.Total_marks * section.section_cutoff) / 100,
      0
    );
    setsectionTotal(totalMarks);
  }, [sectionData]);

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
      <Box
        sx={{
          mt: { xs: -3, sm: 3, md: -4 },
          minHeight: "1px",
          height: "14px",
          marginBottom: "32px",
        }}
      >
        <Link to="/manage-assessment">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              mb: { xs: -1, sm: 3, md: 2 },
              height: "100%",
            }}
          >
            <img
              src={back}
              style={{ height: "16px", marginRight: "8px" }}
              alt="Back"
            />
            <Typography
              variant="body1"
              sx={{
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Go Back
            </Typography>
          </Box>
        </Link>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            mb: { xs: 2, sm: 3, md: "36px" },
            minHeight: "1px",
            height: "30px",
            mt: "32px",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#001F68",
              fontSize: { xs: "24px", sm: "28px", md: "32px" },
              fontWeight: "600",
              mb: { xs: 2, sm: 0 },
            }}
          >
            {/* Capabl DS Assessment - Beginner Level */}
            {/* {titleparam} */}
            {location.state.assessmentDetails.title}
          </Typography>
          <Box
            sx={{
              display: { xs: "-ms-flexbox" },
              mb: { xs: 10, md: 0 },
            }}
          >
            <Button
              variant="outlined"
              sx={{
                fontSize: "14px",
                fontWeight: 600,
                textTransform: "none",
                padding: "8px 16px",
                marginRight: "16px",
              }}
              endIcon={<AddIcon />}
              onClick={openCard}
            >
              Add Section
            </Button>
            <Button
              variant="contained"
              sx={{
                fontSize: "14px",
                fontWeight: 600,
                textTransform: "none",
                padding: "8px 16px",
              }}
              className="bg-primary-500 hover:bg-primary-600 text-white"
              onClick={openTimeCard}
            >
              Save
            </Button>
          </Box>
        </Box>
        {data ? (
          <Box
            sx={{
              display: { sm: "-ms-flexbox", md: "flex" },
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 2, sm: 3, md: 4 },
              mt: { xs: 13, md: "32px" },
            }}
          >
            <Box sx={{ width: { xs: "100%", md: "65%" } }}>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sectionData.map((sec) => sec.title)}
                  strategy={verticalListSortingStrategy}
                >
                  {sectionData.map((sec) => (
                    <>
                      <SortableItem
                        key={sec.title}
                        id={sec.title}
                        section={sec}
                        opendeletecard={opendeletecard}
                      />
                    </>
                  ))}
                </SortableContext>
              </DndContext>
            </Box>
            <Box sx={{ width: { xs: "100%", md: "35%" }, mt: { md: "-13px" } }}>
              <Box
                sx={{
                  border: "1px solid #D7E8FF",
                  borderRadius: "8px",
                  p: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: "#001F68",
                    borderBottom: "1px solid #D7E8FF",
                    pb: 1,
                    mb: 2,
                  }}
                >
                  Assessment Summary
                </Typography>
                <Box>
                  {sectionData.map((sec) => (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                      key={sec.title}
                    >
                      <Typography variant="body2">{sec.title}</Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#001F68", fontWeight: "500" }}
                      >
                        {sec.Total_marks}
                      </Typography>
                    </Box>
                  ))}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderTop: "1px solid #D7E8FF",
                      pt: 1,
                      mt: 1,
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ color: "#001F68", fontWeight: "600" }}
                    >
                      Total
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "#001F68", fontWeight: "600" }}
                    >
                      {sectionTotal}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mt: { xs: 4, sm: 6, md: 8 },
            }}
          >
            <img
              src={computer}
              alt="Computer"
              style={{ maxWidth: "100%", height: "auto" }}
            />
            <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
              No Sections created yet
            </Typography>
            <Button
              variant="contained"
              sx={{
                fontSize: "14px",
                fontWeight: 600,
                textTransform: "none",
                padding: "8px 16px",
              }}
              startIcon={<AddIcon />}
              onClick={openCard}
            >
              Add Section
            </Button>
          </Box>
        )}
      </Box>
      {showTimeCard && (
        <TimeCard onClose={closeTimeCard} onSave={handleSubmitandDuration} />
      )}
      {deletecard && (
        <DeleteCard
          onClose={closedeletecard}
          text="Are you sure you want to delete this Section?"
        />
      )}
      {showSectionCard && (
        <AssessmentSection
          onClose={closeCard}
          IsTimed={
            location.state.assessmentDetails.timed_assessments === false
              ? false
              : true
          }
          // IsTimed={false}
          test_id=""
        />
      )}
      {/* {deletecard && <DeleteCard onClose={closedeletecard} />} */}
    </Container>
  );
}
