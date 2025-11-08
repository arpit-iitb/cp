import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  AssessmentData,
  AssessmentInterface,
  AssessmentItem,
  AssessmentQuestion,
  AssignmentIdeInterface,
  SelectedData,
  SelectedDataAssessment,
  SingleProblemInterface,
} from "../../_utils/interface";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FullScreen,
  FullScreenHandle,
  useFullScreenHandle,
} from "react-full-screen";
import { useAuth } from "hooks/AuthProvider";
import {
  AppBar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fade,
  Modal,
  Typography,
  useTheme,
} from "@mui/material";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import WebCamComponent from "components/WebCam";
import Timer from "components/Timer";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AssessmentType, examType, FaceDetectionEnum } from "../../_utils/enum";
import AssessmentMCQ from "pages/AssessmentPage/AssessmentMCQ";
import AssignmentIde from "pages/AssignmentIde";
import FullStackIde from "pages/Full-stack-Ide";
import ProgramIde from "pages/ProgramIde";
import "./assessment.css";
import axiosHttp from "_utils/axios.index";
import { ApiConstants } from "_utils/api-constants";
import SectionTimer from "components/SectionTimer";
import { AxiosResponse } from "axios";
export default function Assessment() {
  const navigate = useNavigate();
  // const location = useLocation();
  const [data, setData] = useState<AssessmentData>();
  const [currentQuestion, setCurrentQuestion] = useState<AssessmentQuestion>();
  const { id } = useParams();
  const handle = useFullScreenHandle();
  const auth = useAuth();
  const fullScreenRef = useRef<HTMLButtonElement>(null);
  const fullScreenBeginRef = useRef<HTMLButtonElement>(null);
  const [isFullScreen, setFullScreen] = useState<boolean>(false);
  const [stopTimer, setStopTimer] = useState<boolean>(false);
  const [canStart, setCanStart] = useState<boolean>(true);
  const [expanded, setExpanded] = useState<AssessmentItem>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  let [testViolation, setTestViolation] = useState<number>(0);
  const [isSectionTimerActive, setIsSectionTimerActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigationAllowed, setIsNavigationAllowed] = useState(true);
  const [sectionDuration, setSectionDuration] = useState<number>(0);
  const isInitialized = useRef(false);
  const [videoViolations, setVideoViolations] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<SelectedDataAssessment>(
    {}
  );
  const handleClose = () => {
    setOpen(false);
  };
  const fetchData = useCallback(async () => {
    if (id && !isInitialized.current) {
      auth.setShowHeader(false);
      setCanStart(false);

      try {
        const res = await axiosHttp.get(
          ApiConstants.assessment.assessmentDetails(id)
        );
        const assessmentData = res.data;
        sessionStorage.clear();
        localStorage.removeItem("selectedAnswers");
        setData(assessmentData);
        setExpanded(assessmentData.assessment_items[0]);
        setCurrentQuestion(assessmentData.assessment_items[0].questions[0]);
        if (assessmentData.assessment_items[0]?.duration) {
          setSectionDuration(
            assessmentData.assessment_items[0]?.duration as number
          );
          setIsSectionTimerActive(true);
          setIsNavigationAllowed(false);
        }
        setCanStart(true);

        isInitialized.current = true;
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }
  }, [id]);

  useEffect(() => {
    fetchData();
    return () => {
      auth.setShowHeader(true);
    };
  }, []);

  const handleEscape = useCallback(() => {
    setOpenModal(true);
    setFullScreen(false);
    if (document.fullscreenElement) {
      document
        .exitFullscreen()
        .catch((err) =>
          console.error(`Error exiting full-screen mode: ${err}`)
        );
    }
  }, []);

  const handleFaceDetectionViolation = (data: {
    errorType: FaceDetectionEnum;
    message: string;
  }) => {
    setVideoViolations((prev) => prev + 1);
  };

  const handleMouseDown = useCallback((e: MouseEvent | TouchEvent) => {
    if (e.type === "contextmenu") e.preventDefault(); // Disable right-click
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    e.stopPropagation();
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const keysToPrevent = [
      { key: "r", ctrl: true, meta: true },
      { key: "r", ctrl: true, shift: true, meta: true },
      { key: "v", ctrl: true, meta: true },
      { key: "MediaTrackNext" },
      { key: "MediaTrackPrevious" },
      { key: "F5" },
      { key: "c", ctrl: true },
      { key: "Tab", alt: true },
      { key: "Tab", ctrl: true },
      { key: "Alt" },
      { key: "1", ctrl: true, meta: true },
      { key: "2", ctrl: true, meta: true },
      { key: "3", ctrl: true, meta: true },
      { key: "4", ctrl: true, meta: true },
      { key: "5", ctrl: true, meta: true },
      { key: "6", ctrl: true, meta: true },
      { key: "7", ctrl: true, meta: true },
      { key: "8", ctrl: true, meta: true },
      { key: "9", ctrl: true, meta: true },
      { key: "0", ctrl: true, meta: true },
    ];

    const shouldPrevent = keysToPrevent.some(
      ({ key, ctrl, alt, shift, meta }) => {
        return (
          e.key === key &&
          (ctrl ? e.ctrlKey : true) &&
          (alt ? e.altKey : true) &&
          (shift ? e.shiftKey : true) &&
          (meta ? e.metaKey : true)
        );
      }
    );

    if (shouldPrevent) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    const events = [
      { target: window, type: "contextmenu", handler: handleMouseDown },
      { target: window, type: "mousedown", handler: handleMouseDown },
      { target: window, type: "mouseup", handler: handleMouseDown },
      { target: window, type: "mousemove", handler: handleMouseMove },
      { target: window, type: "touchstart", handler: handleMouseDown },
      { target: window, type: "touchend", handler: handleMouseDown },
      { target: window, type: "touchmove", handler: handleMouseMove },
      { target: document, type: "touchstart", handler: handleMouseDown },
      { target: document, type: "touchend", handler: handleMouseDown },
      { target: document, type: "touchmove", handler: handleMouseMove },
      { target: window, type: "keydown", handler: handleKeyDown },
      { target: document, type: "visibilitychange", handler: handleEscape },
    ];

    if (isFullScreen) {
      document.body.classList.add("no-scroll");
      events.forEach(({ target, type, handler }) =>
        target.addEventListener(type, handler as EventListener)
      );
    } else {
      document.body.classList.remove("no-scroll");
      events.forEach(({ target, type, handler }) =>
        target.removeEventListener(type, handler as EventListener)
      );
    }

    return () => {
      events.forEach(({ target, type, handler }) =>
        target.removeEventListener(type, handler as EventListener)
      );
    };
  }, [
    isFullScreen,
    handleMouseDown,
    handleMouseMove,
    handleKeyDown,
    handleEscape,
  ]);

  const handleChange = useCallback(
    (panel: AssessmentItem) =>
      (event: React.SyntheticEvent, newExpanded: boolean) => {
        if (isNavigationAllowed) {
          if (newExpanded) {
            setExpanded(panel);
            setCurrentQuestion(panel.questions[0]);
            if (panel.duration) {
              setSectionDuration(panel.duration as number);
              setIsSectionTimerActive(true);
              setIsNavigationAllowed(false);
            } else {
              setIsSectionTimerActive(false);
              setIsNavigationAllowed(true);
            }
          }
        }
      },
    [isNavigationAllowed]
  );

  const handleQuestionChange = (
    question: AssessmentQuestion,
    index: number
  ) => {
    setCurrentQuestion(question);
    setCurrentQuestionIndex(index);
  };
  const handleNextQuestion = () => {
    if (expanded) {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < expanded.questions.length) {
        handleQuestionChange(expanded.questions[nextIndex], nextIndex);
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (expanded) {
      const prevIndex = currentQuestionIndex - 1;
      if (prevIndex >= 0) {
        handleQuestionChange(expanded.questions[prevIndex], prevIndex);
      }
    }
  };

  const handleQuestionUpdate = (updatedQuestion: AssessmentQuestion) => {
    let tempData = { ...data } as AssessmentData;
    tempData.assessment_items?.forEach((assessment_item) => {
      if (assessment_item.type === expanded?.type) {
        assessment_item.questions.forEach((question) => {
          if (question.id === updatedQuestion.id) {
            question["flagged"] = !question["flagged"];
            if (question?.answered) {
              question["answered"] = question["answered"];
            }
          }
        });
      }
    });
    setData(tempData);
  };

  const handleAnswerUpdate = (
    updatedQuestion: AssessmentQuestion,
    answer: any,
    type: AssessmentType
  ) => {
    let tempData = { ...data } as AssessmentData;
    tempData.assessment_items?.forEach((assessment_item) => {
      switch (type) {
        case AssessmentType.MCQ:
          assessment_item.questions.forEach((question) => {
            if (question.id === updatedQuestion.id) {
              question.answered =
                (!!answer[assessment_item?.title as any]?.answers?.[
                  question.id
                ] as any) ?? false;
            }
          });
          break;

        case AssessmentType.CODING:
          assessment_item.questions.forEach((question) => {
            if (question.id === updatedQuestion.id) {
              question.answered =
                !!answer[assessment_item?.title]?.answers?.[question.id];
            }
          });
          break;

        case AssessmentType.SUBJECTIVE:
          assessment_item.questions.forEach((question) => {
            if (question.id === updatedQuestion.id) {
              question.answered =
                !!answer[assessment_item?.title]?.answers?.[question.id];
            }
          });
          break;

        default:
          break;
      }
    });

    setData(tempData);
  };
  const timeOutHandler = () => {
    sessionStorage.removeItem("endTime");
    setStopTimer(true);
    handleSubmit();
  };
  const timeOutSectionHandler = () => {
    sessionStorage.removeItem("endTimeSection");
    setIsNavigationAllowed(true);
    setSectionDuration(0);
    setIsSectionTimerActive(false);

    const currentIndex = data?.assessment_items.findIndex(
      (item) => item.type === expanded?.type
    );
    const nextIndex = currentIndex !== undefined ? currentIndex + 1 : 0;
    const nextSection = data?.assessment_items[nextIndex];

    if (nextSection) {
      setTimeout(() => {
        if (nextSection.duration) {
          setSectionDuration(nextSection.duration as number);
          setIsSectionTimerActive(true);
          setIsNavigationAllowed(false);
        } else {
          setIsSectionTimerActive(false);
          setIsNavigationAllowed(true);
        }

        setExpanded(nextSection);
        setCurrentQuestion(nextSection.questions[0]);
      }, 200);
    } else {
      setIsSectionTimerActive(false);
      setIsNavigationAllowed(true);
    }
  };

  const handleFullScreenChange = (
    state: boolean,
    fullScreenHandler: FullScreenHandle
  ) => {
    if (isFullScreen && !state) {
      setOpenModal(true);
      setFullScreen(false);
    }
  };

  function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  function getRemainingTime(endTime: string | Date): string {
    const now = new Date();
    const end = new Date(endTime);
    const remainingTimeInSeconds = Math.max(
      0,
      Math.floor((end.getTime() - now.getTime()) / 1000)
    );
    return formatTime(remainingTimeInSeconds);
  }
  const handleSubmit = () => {
    if (isSubmitting) return; // Prevent further submissions
    setIsSubmitting(true);
    const openDatas = localStorage?.getItem("formData");
    const openData = JSON.parse(openDatas as string);
    setSubmitted(true);
    let endtimes = sessionStorage.getItem("endTime");
    let endTime =
      endtimes !== null ? JSON.parse(endtimes) : new Date().toISOString();
    let remainingTimeFormatted = getRemainingTime(endTime);
    let dataSubmissionObj: any = {
      violations: testViolation,
      videoViolations: videoViolations,
      remaining_time: remainingTimeFormatted,
      openData: openData ? openData : "",
    };
    let assessment_items: any[] = [];
    let selectedAnswers: SelectedDataAssessment = {};
    if (selectedAnswer && Object.keys(selectedAnswer).length === 0) {
      selectedAnswers = JSON.parse(
        localStorage.getItem("selectedAnswers") || "{}"
      );
    } else {
      selectedAnswers = selectedAnswer;
    }

    const submissionData = data?.assessment_items.map((item) => ({
      type: item.type,
      title: item.title,
      answers: item.questions.map((question: any) => ({
        [question.id]:
          selectedAnswers[item.title as string]?.answers?.[question?.id] ?? "",
      })),
    }));
    assessment_items.push(submissionData);
    dataSubmissionObj["assessment_items"] = assessment_items[0];

    try {
      if (!submitted) {
        if (openData && Object.values(openData)?.length > 0) {
          axiosHttp
            .post(
              ApiConstants.assessment.submitAssessment(id as string),
              dataSubmissionObj
            )
            .then((res: AxiosResponse) => {
              localStorage.clear();
              navigate(`/assessment/online-assessment/test-id/${id}/result`, {
                state: { submissionData: data?.show_result ? res.data : null },
              });
            });
          setIsSubmitting(false);
        }
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error("Failed to fetch data:", error);
    }
  };
  const countTestViolation = () => {
    setTestViolation((prevViolation) => prevViolation + 1);
    if ((data?.max_violations as number) - testViolation <= 0) {
      handleSubmit();
      setTimeout(() => {
        setFullScreen(false);
      }, 1000);
    }
    if (data && (data?.max_violations as number) < testViolation) {
      setFullScreen(false);
    }
  };
  const questionData = () => {
    return (
      <>
        {data?.assessment_items.map((item, index) => (
          <Accordion
            key={index}
            sx={{
              borderRadius: "0.75rem",
              marginBottom: "0.5rem",
              overflow: "hidden",
              border: "1px solid #EBF3FF",
            }}
            onChange={handleChange(item)}
            expanded={
              expanded?.type === item.type && expanded.title === item.title
            }
            elevation={0}
            disableGutters
            square
            variant="outlined"
            defaultExpanded={index === 0}
          >
            <AccordionSummary
              sx={{
                borderBottom:
                  expanded?.type === item.type && expanded.title === item.title
                    ? "none"
                    : ``,
                "& .MuiSvgIcon-root": {
                  transform:
                    expanded?.type === item.type &&
                    expanded.title === item.title
                      ? "rotate(90deg)"
                      : "rotate(0deg)",
                  transition: "transform 0.2s",
                },
              }}
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
            >
              <div>
                <p
                  className={`text-xl font-semibold ${
                    expanded?.type === item.type &&
                    expanded.title === item.title
                      ? "text-[#1F1F1F]"
                      : "text-[#939393]"
                  }`}
                >
                  {item.title}
                </p>
                {/* <div className="flex space-x-2 mt-2">
                                    {item?.easy_question_marks as number > 0 && (
                                        <span className="bg-primary-200 text-primary-800 px-1 py-1 rounded-lg text-sm">Easy : <span className="font-bold">{item?.easy_question_marks}</span></span>
                                    )}
                                    {item?.medium_question_marks as number > 0 && (
                                        <span className="bg-primary-200 text-primary-800 px-1 py-1 rounded-lg text-sm">Medium: <span className="font-bold">{item?.medium_question_marks}</span></span>
                                    )}
                                    {item?.hard_question_marks as number > 0 && (
                                        <span className="bg-primary-200 text-primary-800 px-1 py-1 rounded-lg text-sm">Hard:<span className="font-bold">{item?.hard_question_marks}</span></span>
                                    )}
                                </div> */}
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <div className="grid grid-cols-5 gap-2">
                {item.questions.map((question, qIndex) => (
                  <div
                    key={qIndex}
                    className="w-full h-full flex justify-center items-center"
                  >
                    <div
                      onClick={() => handleQuestionChange(question, qIndex)}
                      className={`w-8 h-8 cursor-pointer flex justify-center items-center rounded  border border-[#1F1F1F]
                    ${
                      question?.answered
                        ? "border border-[#3183FF] text-[#3183FF] bg-[#E6F0FF]"
                        : ""
                    }
                     ${
                       question?.flagged === true
                         ? "border border-orange-400 text-orange-400 bg-[#FFF4EB]"
                         : ""
                     } 
                    ${
                      question?.answered && question?.flagged === true
                        ? "border border-secondary-600 text-secondary-600 bg-[#F2994A]"
                        : ""
                    }
                    ${
                      currentQuestion?.id === question?.id
                        ? "border border-[#001F68] text-[#001F68] bg-[#EFF4FF]"
                        : ""
                    }`}
                    >
                      {qIndex + 1}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionDetails>
          </Accordion>
        ))}
      </>
    );
  };

  const renderQuestion = () => {
    switch (expanded?.type) {
      case AssessmentType.MCQ:
        return (
          currentQuestion && (
            <AssessmentMCQ
              key={expanded.type}
              question={currentQuestion as AssessmentQuestion}
              onUpdateQuestion={handleQuestionUpdate}
              onNext={handleNextQuestion}
              onPrevious={handlePreviousQuestion}
              title={expanded?.title}
              disableNext={
                currentQuestionIndex === expanded?.questions.length - 1
              }
              disablePrevious={currentQuestionIndex === 0}
              onAnswerSelected={(answer: string) => {
                setSelectedAnswer((prev: any) => ({
                  ...prev,
                  ...(answer as any),
                }));
                handleAnswerUpdate(currentQuestion, answer, AssessmentType.MCQ);
              }}
            />
          )
        );

      case AssessmentType.CODING:
        if (currentQuestion?.full_stack_evaluation) {
          return (
            currentQuestion && (
              <FullStackIde
                flagAction={() => {
                  currentQuestion.flagged = !currentQuestion?.flagged ?? false;
                }}
                fullData={currentQuestion as SingleProblemInterface}
                customIde={true}
                key={currentQuestion?.id}
                batchName={id}
                onCodeChange={(data: any) => {
                  let current = currentQuestion as AssessmentQuestion;
                  setSelectedAnswer((prev: any) => ({
                    ...prev,
                    [expanded.title]: {
                      type: AssessmentType.CODING,
                      answers: {
                        ...prev[expanded.title]?.answers,
                        [current?.id]: Number.isNaN(data) ? "0" : String(data),
                      },
                    },
                  }));
                  let dataObj = {
                    [expanded.title]: {
                      type: AssessmentType.CODING,
                      answers: {
                        [current?.id]: Number.isNaN(data) ? "0" : String(data),
                      },
                    },
                  };
                  handleAnswerUpdate(current, dataObj, AssessmentType.CODING);
                }}
              />
            )
          );
        } else {
          return (
            <ProgramIde
              fullData={currentQuestion as SingleProblemInterface}
              customIde={true}
              key={currentQuestion?.id}
              batchName={id}
              onCodeChange={(data: any) => {
                let current = currentQuestion as AssessmentQuestion;
                setSelectedAnswer((prev: any) => ({
                  ...prev,
                  [expanded.title]: {
                    type: AssessmentType.CODING,
                    answers: {
                      ...prev[expanded.title]?.answers,
                      [current?.id]: Number.isNaN(data) ? "0" : String(data),
                    },
                  },
                }));
                let dataObj = {
                  [expanded.title]: {
                    type: AssessmentType.CODING,
                    answers: {
                      [current?.id]: Number.isNaN(data) ? "0" : String(data),
                    },
                  },
                };
                handleAnswerUpdate(current, dataObj, AssessmentType.CODING);
              }}
            />
          );
        }

      case AssessmentType.SUBJECTIVE:
        return (
          <AssignmentIde
            fullData={currentQuestion as AssignmentIdeInterface}
            customIde={true}
            key={currentQuestion?.id}
            batchName={id}
            onCodeChange={(data: any) => {
              let current = currentQuestion as AssessmentQuestion;
              setSelectedAnswer((prev: any) => ({
                ...prev,
                [expanded.title]: {
                  type: AssessmentType.SUBJECTIVE,
                  answers: {
                    ...prev[expanded.title]?.answers,
                    [current?.id]: Number.isNaN(data) ? "0" : String(data),
                  },
                },
              }));
              let dataObj = {
                [expanded.title]: {
                  type: AssessmentType.CODING,
                  answers: {
                    [current?.id]: Number.isNaN(data) ? "0" : String(data),
                  },
                },
              };
              handleAnswerUpdate(current, dataObj, AssessmentType.SUBJECTIVE);
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {canStart && !submitted ? (
        <>
          <section className="min-h-[88svh] h-screen flex items-center justify-center">
            <div className="text-center">
              {!isFullScreen && (
                <Button
                  variant="contained"
                  ref={fullScreenBeginRef}
                  disabled={!canStart}
                  className="!normal-case bg-primary-500 rounded-xl"
                  onClick={async () => {
                    setFullScreen(true);
                    await handle.enter();
                  }}
                >
                  Begin now
                </Button>
              )}

              <FullScreen
                onChange={handleFullScreenChange}
                className="assessment-bg my-3 text-start"
                handle={handle}
              >
                {isFullScreen ? (
                  <>
                    <AppBar component="nav">
                      <Toolbar className="w-full bg-white">
                        <div className="text-[#001F68] flex justify-between items-center container">
                          <Typography variant="h6" component="div">
                            {data?.title ?? "Assessment Test"}
                          </Typography>
                          <Box>
                            {data?.proctored && (
                              <WebCamComponent
                                width={100}
                                height={70}
                                showBorder={false}
                                inAssessment={true}
                                faceDetectionError={
                                  handleFaceDetectionViolation
                                }
                                faceDetected={(res: boolean) => {}}
                              />
                            )}
                          </Box>
                          <Box className="flex items-center gap-2">
                            {stopTimer ? null : (
                              <Timer
                                timeOverCallback={timeOutHandler}
                                totalTime={Number(data?.duration) as number}
                              />
                            )}
                            <Button
                              className="!rounded-lg !normal-case !py-1 !bg-primary-500"
                              variant="contained"
                              onClick={handleSubmit}
                              disableElevation={true}
                            >
                              Submit Test
                            </Button>
                          </Box>
                        </div>
                      </Toolbar>
                    </AppBar>
                    <Box className="mb-4">
                      <Toolbar />
                    </Box>
                    <div className="container">
                      <p className="text-xl font-semibold text-[#001F68] mb-4">
                        Questions
                      </p>
                      <div className="grid grid-cols-4 gap-4 h-full mb-4 ">
                        <div className="col">{questionData()}</div>

                        <div className="col-span-3 h-full border !border-primary-50 rounded-xl p-2">
                          {expanded && currentQuestion && expanded.type ? (
                            <>
                              <div className="flex justify-end mb-1">
                                {sectionDuration > 0 && (
                                  <>
                                    <p className="font-bold my-auto me-3">
                                      {expanded.title}
                                    </p>
                                    <SectionTimer
                                      timeOverCallback={timeOutSectionHandler}
                                      totalTime={sectionDuration as number}
                                    />
                                  </>
                                )}
                              </div>
                              <div className="max-h-[80svh] !overflow-y-auto">
                                {renderQuestion()}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-2xl flex justify-center items-center">
                                Please select a section to proceed further!
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>You will be entering full screen mode for the assessment.</>
                )}
              </FullScreen>

              <Dialog
                open={openModal}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogContent>
                  <DialogContentText
                    id="alert-dialog-description"
                    className="text-center"
                  >
                    <div className="text-2xl font-bold mb-3">
                      You have just exited full screen!{" "}
                      {Number((data?.max_violations as number) - testViolation)}{" "}
                      of {data?.max_violations} violations left. Click to enable
                      full screen and continue
                    </div>
                    <div className="hidden">
                      {" "}
                      {stopTimer ? null : (
                        <Timer
                          timeOverCallback={timeOutHandler}
                          totalTime={10}
                        />
                      )}
                    </div>
                    {!isFullScreen && (
                      <Button
                        variant="contained"
                        className="!normal-case bg-primary-500 rounded-xl"
                        ref={fullScreenRef}
                        onClick={async () => {
                          try {
                            setOpenModal(false);
                            if (
                              (data?.max_violations as number) -
                                testViolation <=
                              0
                            ) {
                              console.info("came here");
                              setFullScreen(false);
                              await handle.exit();
                            } else {
                              await handle.enter();
                              setFullScreen(true);
                            }
                            countTestViolation();
                          } catch (error) {
                            console.error("Error handling fullscreen:", error);
                          }
                        }}
                      >
                        Continue
                      </Button>
                    )}
                  </DialogContentText>
                </DialogContent>
              </Dialog>
            </div>
          </section>
        </>
      ) : null}
    </>
  );
}
