import * as React from "react";
import { useEffect, useState } from "react";
import { Lesson, ProblemDataInterface } from "../../_utils/interface";
import axiosHttp from "../../_utils/axios.index";
import { ApiConstants } from "../../_utils/api-constants";
import { AxiosResponse } from "axios";
import {
  AccordionDetails,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
} from "@mui/material";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import ProgressBar from "components/ProgressBar";
import { DifficultyLevel, LessonType, ProblemStatus } from "../../_utils/enum";
import CodeIcon from "@mui/icons-material/Code";
import VideocamIcon from "@mui/icons-material/Videocam";
import LibraryAddCheckIcon from "@mui/icons-material/LibraryAddCheck";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { useNavigate } from "react-router-dom";
import "./style.css";
import { useAuth } from "hooks/AuthProvider";
import AddIcon from "@mui/icons-material/Add";
import { SortableList } from "components/SortableList";
import { Bounce, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Divider from "@mui/material/Divider";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  CommandLineIcon,
  DocumentTextIcon,
  ListBulletIcon,
  VideoCameraIcon,
  LockClosedIcon,
  LockOpenIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { BoltIcon } from "@heroicons/react/24/solid";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { ActionCreators } from "state/action-creators";
import { State } from "state/reducers";
import LessonWeekTable from "components/LessonWeekTable/LessonWeekTable";

const dummy = [1, 2, 3, 4, 5, 6];

export default function ProblemList({
  batchName,
  sidePanel,
  handleClose,
  isAdmin,
  openAddContent,
  refreshContent,
}: {
  batchName: string;
  sidePanel?: boolean;
  handleClose?: any;
  isAdmin?: boolean;
  refreshContent?: boolean;
  openAddContent?: (week: number) => void;
}) {
  const dispatch = useDispatch();
  const { updateProblemList, setCurrentWeek } = bindActionCreators(
    ActionCreators,
    dispatch
  );
  const problemState = useSelector((state: State) => state.problemList);
  const authContext = useAuth();
  const [problemData, setProblemData] = useState<ProblemDataInterface>();
  const [lessonFilter, setLessonFilter] = useState<LessonType | null>(null);
  const [loading, setLoading] = useState(true);
  const [cachedLessons, setCachedLessons] = useState<Map<number, boolean>>(
    new Map<number, boolean>()
  );
  const [loadingLesson, setLoadingLesson] = useState<boolean>(true);
  const [expanded, setExpanded] = React.useState<string | false>("");
  const [currWeek, setCurrWeek] = React.useState<number | null>(null);
  const [currLesson, setCurrLesson] = useState<number | null>(null);
  const handleChange =
    (panel: string, weekNum: number) =>
    (event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false);
      if (newExpanded) {
        sessionStorage.setItem("week_number", (weekNum - 1).toString());
        getWeeksLesson(weekNum);
      }
    };
  const navigate = useNavigate();

  useEffect(() => {
    getData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (refreshContent) {
      getData();
    }
    // eslint-disable-next-line
  }, [refreshContent]);

  function saveStateInLocalStorage() {
    sessionStorage.setItem("cachedState", JSON.stringify(problemState));
  }

  function getData(refresh?: boolean) {
    let ApiUrl = ApiConstants.lessons.weekList(batchName);
    if (isAdmin) {
      ApiUrl = ApiConstants.admin.lesson.weekList(batchName);
    }
    axiosHttp.get(ApiUrl).then((res: AxiosResponse) => {
      setProblemData(res.data);
      updateProblemList(res.data);
      saveStateInLocalStorage();
      authContext.updateClientLogo(res.data.logo);
      setLoading(false);
      let week = sessionStorage.getItem("week_number");
      if (week) {
        setCurrWeek(parseInt(week));
        setCurrentWeek(parseInt(week));
        saveStateInLocalStorage();
      }
    });
  }
  useEffect(() => {
    if (problemData && problemData?.weekwise_data) {
      let currWeek = sessionStorage.getItem("week_number");
      let currLesson = sessionStorage.getItem("lesson_id");
      if (currWeek) {
        setExpanded("panel" + currWeek);
        getWeeksLesson(parseInt(currWeek) + 1);
      }
      if (currLesson) {
        setCurrLesson(JSON.parse(currLesson));
      }
    }
    // eslint-disable-next-line
  }, [currWeek]);

  useEffect(() => {
    document.querySelector(".active")?.scrollIntoView({ behavior: "smooth" });
  }, [currLesson]);

  function sortProblemData(data: any, weekNum: number) {
    let copyProblemData = { ...problemData } as ProblemDataInterface;
    if (Array.isArray(data)) {
      data.sort((a: Lesson, b: Lesson) => a.priority_order - b.priority_order);
      if (copyProblemData.weekwise_data) {
        copyProblemData.weekwise_data[weekNum - 1]["lessons"] = [...data];
      }
    } else {
      data.lessons.sort(
        (a: Lesson, b: Lesson) => a.priority_order - b.priority_order
      );
      if (copyProblemData.weekwise_data) {
        copyProblemData.weekwise_data[weekNum - 1]["lessons"] = [
          ...data.lessons,
        ];
      }
    }

    setProblemData(copyProblemData);
    updateProblemList(copyProblemData);
    saveStateInLocalStorage();
  }

  const filterLessons = (
    lessons: Lesson[],
    filter: LessonType | null
  ): Lesson[] => {
    return (lessons || []).filter((lesson) => {
      if (filter === LessonType.VIDEO) {
        return lesson.type === LessonType.VIDEO;
      } else if (filter === LessonType.PROBLEM) {
        return lesson.type === LessonType.PROBLEM;
      } else if (filter === LessonType.MCQ) {
        return lesson.type === LessonType.MCQ;
      } else if (filter === LessonType.ASSIGNMENT) {
        return lesson.type === LessonType.ASSIGNMENT;
      } else if (filter === LessonType.TEXT) {
        return lesson.type === LessonType.TEXT;
      }
      return true;
    });
  };

  const getWeeksLesson = (weekNum: number) => {
    setCurrWeek(weekNum - 1);
    setCurrentWeek(weekNum - 1);
    saveStateInLocalStorage();
    setLessonFilter(null);
    if (
      !problemData?.weekwise_data[weekNum - 1]?.lessons ||
      cachedLessons.get(weekNum) == null
    ) {
      setLoadingLesson(true);
      let ApiURL = ApiConstants.lessons.lessonList(weekNum, batchName);
      if (isAdmin) {
        ApiURL = ApiConstants.admin.lesson.lessonList(batchName, weekNum);
      }
      axiosHttp
        .get(ApiURL)
        .then((res: AxiosResponse) => {
          sortProblemData(res.data, weekNum);
          let map = cachedLessons;
          map.set(weekNum, true);
          setCachedLessons(map);
          setLoadingLesson(false);
        })
        .catch((error) => {
          throw error;
        });
    }
  };

  function handleRedirection(batchName: string, lesson: Lesson) {
    if (handleClose) {
      handleClose();
    }
    const { type, id, isFullStackProblem } = lesson;
    sessionStorage.setItem("lesson_id", id);
    switch (type) {
      case LessonType.PROBLEM:
        if (isFullStackProblem) {
          navigate(`/problems/full-stack/${batchName}/${id}`);
          break;
        }
        navigate(`/problems/problem/${batchName}/${id}`);
        break;
      case LessonType.ASSIGNMENT:
        navigate(`/problems/assignment/${batchName}/${id}`);
        break;
      case LessonType.TEXT:
        navigate(`/problems/text/${batchName}/${id}`);
        break;
      case LessonType.MCQ:
        navigate(`/problems/mcq/${batchName}/${id}`);
        break;
      case LessonType.VIDEO:
        navigate(`/problems/video/${batchName}/${id}`);
        break;
    }
  }

  function setUpdatedLesson(data: Lesson[], weekNumber: number) {
    let newProblem = { ...problemData } as ProblemDataInterface;
    newProblem.weekwise_data[weekNumber - 1].lessons = [...data];
    newProblem.weekwise_data[weekNumber - 1]["isChanged"] = true;
    setProblemData(newProblem);
    updateProblemList(newProblem);
    saveStateInLocalStorage();
  }

  const saveOrder = (weekNumber: number): void => {
    const updatedLessons = [] as {
      lesson_id: number;
      priority_order: string;
    }[];
    problemData?.weekwise_data[weekNumber - 1]?.lessons.forEach(
      (lesson, idx) => {
        updatedLessons.push({
          lesson_id: lesson.lesson_id,
          priority_order: (idx + 1).toFixed(2),
        });
      }
    );
    axiosHttp
      .post(
        ApiConstants.admin.lesson.update(batchName, weekNumber),
        updatedLessons
      )
      .then((data) => {
        let newProblem = { ...problemData } as ProblemDataInterface;
        newProblem.weekwise_data[weekNumber - 1]["isChanged"] = false;
        setProblemData(newProblem);
        updateProblemList(newProblem);
        saveStateInLocalStorage();
        toast.success("Data Updated Successfully!", {
          position: "top-center",
          closeOnClick: true,
          pauseOnHover: true,
          transition: Bounce,
          theme: "colored",
          containerId: "contentId",
        });
      })
      .catch((err: Error) => {
        toast.error("Something went wrong. Could not update Data", {
          position: "top-center",
          closeOnClick: true,
          pauseOnHover: true,
          transition: Bounce,
          theme: "colored",
          containerId: "contentId1",
        });
        throw new Error(err.message);
      });
  };

  const convertDuration = (durationSeconds: number): string => {
    if (durationSeconds != null) {
      const hours = Math.floor(durationSeconds / 3600);
      const minutes = Math.floor((durationSeconds % 3600) / 60);
      const seconds = durationSeconds % 60;
      const hh = hours.toString().padStart(2, "0");
      const mm = minutes.toString().padStart(2, "0");
      const ss = seconds.toString().padStart(2, "0");

      return hours > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
    }
    return "";
  };

  const removeLesson = (weekNumber: number, lessonId: number) => {
    axiosHttp
      .delete(ApiConstants.admin.lesson.remove(batchName, weekNumber, lessonId))
      .then((res: AxiosResponse) => {
        let newProblemData = { ...problemData } as ProblemDataInterface;
        newProblemData.weekwise_data[weekNumber - 1].lessons =
          newProblemData.weekwise_data[weekNumber - 1].lessons.filter(
            (single) => single.lesson_id !== lessonId
          );
        setProblemData(newProblemData);
        toast.success("Deleted Content Successfully!", {
          position: "top-center",
          closeOnClick: true,
          pauseOnHover: true,
          transition: Bounce,
          theme: "colored",
          containerId: "contentId",
        });
      })
      .catch((err: Error) => {
        toast.error("Couldn't update the Content", {
          position: "top-center",
          closeOnClick: true,
          pauseOnHover: true,
          transition: Bounce,
          theme: "colored",
          containerId: "contentId1",
        });
        throw new Error(err.message);
      });
  };

  return (
    <>
      {loading ? (
        <>
          <div className="grid grid-cols-1 gap-4">
            {dummy?.map((s) => (
              <div
                key={s}
                className="py-12 bg-gray-200 animate-pulse rounded-2xl"
              ></div>
            ))}
          </div>
        </>
      ) : (
        problemData &&
        problemData.weekwise_data?.map((single, index) => (
          <MuiAccordion
            elevation={0}
            square
            key={index}
            className={`bg-white mb-2 border border-solid border-[rgba(217,232,255,1)] rounded-2xl ${
              expanded === `panel${index}` ? "active" : ""
            }`}
            expanded={expanded === `panel${index}`}
            onChange={handleChange(`panel${index}`, index + 1)}
          >
            <MuiAccordionSummary
              className={`!overflow-hidden ${
                !single.canSolve
                  ? "text-gray-500"
                  : isAdmin
                  ? "text-[#FF8E08]"
                  : "text-[#007bff]"
              } rounded-t-md flex items-center`}
              aria-controls="panel1d-content"
              id="panel1d-header"
            >
              <div className="!overflow-hidden p-2 py-2 grid grid-cols-10 w-full gap-1">
                {!(isAdmin && openAddContent) ? (
                  <div className="col-span-7">
                    <div className="grid grid-rows-3 h-full">
                      <div className="row-span-1 flex items-center gap-2 h-4 w-auto ">
                        {!isAdmin ? (
                          !single.canSolve ? (
                            <LockClosedIcon className="h-4 w-4 text-[#73ABFF]" />
                          ) : (
                            <LockOpenIcon className="h-4 w-4 text-[#73ABFF]" />
                          )
                        ) : null}
                        <p className="text-[#73ABFF] text-xs font-semibold md:text-sm h-4 flex items-center">
                          Week {index + 1}
                        </p>
                      </div>
                      <div className="row-span-2 flex items-start">
                        <Tooltip title={single.topic_description}>
                          <p className="text-[#1F1F1F] text-lg font-bold overflow-hidden line-clamp-2">
                            {single.topic_description}
                          </p>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="col-span-5">
                    <div className="flex items-center gap-2 h-full">
                      <p className="text-md font-semibold md:text-lg">
                        Week {index + 1}
                      </p>
                    </div>
                  </div>
                )}

                {!isAdmin && !sidePanel ? (
                  <div className="col-span-3">
                    <div className="mt-2 ml-2 h-18">
                      <ProgressBar
                        count={parseFloat(
                          (
                            (single.total_lessons_completed /
                              single.total_lessons) *
                            100
                          ).toFixed(2)
                        )}
                        showCount={true}
                      />
                    </div>
                    <div className="flex flex-wrap w-full items-start">
                      {single.total_videos > 0 && (
                        <Tooltip title={"Total Videos Done"}>
                          <span className="flex flex-row items-center p-1 m-1 gap-2 px-2 text-sm h-6 w-auto bg-[#E6F0FF] rounded-[29px]">
                            <VideoCameraIcon className="h-5 w-5 text-primary-500" />
                            {`${single.completed_videos}/${single.total_videos}`}
                          </span>
                        </Tooltip>
                      )}
                      {single.total_mcq_assignments > 0 && (
                        <Tooltip title={"Total MCQs Done"}>
                          <span className="flex flex-row items-center p-1 m-1 gap-2 px-2 text-sm h-6 w-auto bg-[#E6F0FF] rounded-[29px]">
                            <ListBulletIcon className="h-5 w-5 text-primary-500" />
                            {`${single.completed_mcq_assignments}/${single.total_mcq_assignments}`}
                          </span>
                        </Tooltip>
                      )}
                      {single.total_problems > 0 && (
                        <Tooltip title={"Total Coding Problems Done"}>
                          <span className="flex flex-row items-center p-1 m-1 gap-2 px-2 text-sm h-6 w-auto bg-[#E6F0FF] rounded-[29px]">
                            <CommandLineIcon className="h-5 w-5 text-primary-500" />
                            {`${single.completed_problems}/${single.total_problems}`}
                          </span>
                        </Tooltip>
                      )}
                      {single.total_assignments > 0 && (
                        <Tooltip title={"Total Assignments Done"}>
                          <span className="flex flex-row items-center p-1 m-1 text-sm h-6 w-auto bg-[#E6F0FF] rounded-[29px]">
                            <DocumentTextIcon className="h-5 w-5 text-primary-500" />
                            {`${single.completed_assignments}/${single.total_assignments}`}
                          </span>
                        </Tooltip>
                      )}
                      {single.total_text_contents > 0 && (
                        <Tooltip title={"Total Reading Done"}>
                          <span className="flex flex-row items-center p-1 m-1 text-sm h-6 w-auto bg-[#E6F0FF] rounded-[29px]">
                            <DocumentTextIcon className="h-5 w-5 text-primary-500" />
                            {`${single.completed_text_contents}/${single.total_text_contents}`}
                          </span>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                ) : null}

                {isAdmin && openAddContent ? (
                  <div className="col-span-5">
                    <div className="flex w-full gap-1 items-stretch justify-end">
                      <Button
                        className="!text-sm !normal-case"
                        startIcon={<AddIcon />}
                        disableElevation={true}
                        variant="contained"
                        color="primary"
                        onClick={() => openAddContent(index)}
                      >
                        Add Content
                      </Button>
                      {single?.isChanged ? (
                        <Button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            saveOrder(single.week_number);
                          }}
                          disableElevation={true}
                          className="!text-sm !normal-case"
                          color="primary"
                          variant="contained"
                        >
                          Save Changes
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </MuiAccordionSummary>
            <AccordionDetails>
              {isAdmin && single?.lessons && single?.lessons.length > 0 ? (
                <>
                  <SortableList
                    items={single.lessons}
                    onChange={(data: Lesson[]) => {
                      setUpdatedLesson(data, single.week_number);
                    }}
                    renderItem={(item) => (
                      <SortableList.Item id={item.id}>
                        <div className="flex gap-2">
                          <p>{item.title}</p>
                          <Divider
                            className="!h-[25px]"
                            orientation="vertical"
                          />
                          <p
                            className={`font-bold 
                                                    ${
                                                      DifficultyLevel[
                                                        item.difficulty_level
                                                      ] === DifficultyLevel["1"]
                                                        ? "text-green-500"
                                                        : DifficultyLevel[
                                                            item
                                                              .difficulty_level
                                                          ] ===
                                                          DifficultyLevel["2"]
                                                        ? "text-yellow-800"
                                                        : "text-red-500"
                                                    }`}
                          >
                            {DifficultyLevel[item.difficulty_level]}
                          </p>
                          <Divider
                            className="!h-[25px]"
                            orientation="vertical"
                          />
                          <Tooltip
                            title={
                              item.type === LessonType.PROBLEM
                                ? "Problem"
                                : item.type === LessonType.MCQ
                                ? "MCQ"
                                : item.type === LessonType.ASSIGNMENT
                                ? "Assignment"
                                : item.type === LessonType.TEXT
                                ? "Reading"
                                : item.type === LessonType.VIDEO
                                ? "Video"
                                : "Full Stack"
                            }
                          >
                            {item.type === LessonType.PROBLEM ? (
                              <CodeIcon className="text-[#ff0043]" />
                            ) : item.type === LessonType.VIDEO ? (
                              <VideocamIcon className="text-[#17a2b8]" />
                            ) : item.type === LessonType.MCQ ? (
                              <LibraryAddCheckIcon className="text-[#17a2b8]" />
                            ) : (
                              <AssignmentIcon className="text-yellow-700" />
                            )}
                          </Tooltip>
                        </div>
                        <div className="flex gap-2 items-center">
                          <IconButton
                            onClick={() => {
                              removeLesson(single.week_number, item.lesson_id);
                            }}
                            aria-label="delete"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                          <SortableList.DragHandle />
                        </div>
                      </SortableList.Item>
                    )}
                  />
                </>
              ) : (
                <>
                  {!(isAdmin && openAddContent) &&
                  !loadingLesson &&
                  single?.lessons ? (
                    <div className="flex w-full items-start !text-blue-500">
                      {single?.lessons && single?.lessons.length > 0 && (
                        <div
                          className={`flex flex-row items-center p-1 m-1 gap-2 px-2 text-xs h-6 w-auto bg-[#E6F0FF] rounded-[29px] border cursor-pointer ${
                            lessonFilter === null
                              ? "border-blue-500"
                              : "hover:border-blue-500"
                          }`}
                          onClick={() => setLessonFilter(null)}
                        >
                          All ({single.lessons.length})
                        </div>
                      )}
                      {single?.total_videos > 0 && (
                        <div
                          className={`flex flex-row items-center p-1 m-1 gap-2 px-2 text-xs h-6 w-auto bg-[#E6F0FF] rounded-[29px] border cursor-pointer ${
                            lessonFilter === LessonType.VIDEO
                              ? "border-blue-500"
                              : "hover:border-blue-500"
                          }`}
                          onClick={() => setLessonFilter(LessonType.VIDEO)}
                        >
                          Video ({single.total_videos})
                        </div>
                      )}
                      {single?.total_problems > 0 && (
                        <div
                          className={`flex flex-row items-center p-1 m-1 gap-2 px-2 text-xs h-6 w-auto bg-[#E6F0FF] rounded-[29px] border cursor-pointer ${
                            lessonFilter === LessonType.PROBLEM
                              ? "border-blue-500"
                              : "hover:border-blue-500"
                          }`}
                          onClick={() => setLessonFilter(LessonType.PROBLEM)}
                        >
                          Problem ({single.total_problems})
                        </div>
                      )}
                      {single?.total_mcq_assignments > 0 && (
                        <div
                          className={`flex flex-row items-center p-1 m-1 gap-2 px-2 text-xs h-6 w-auto bg-[#E6F0FF] rounded-[29px] border cursor-pointer ${
                            lessonFilter === LessonType.MCQ
                              ? "border-blue-500"
                              : "hover:border-blue-500"
                          }`}
                          onClick={() => setLessonFilter(LessonType.MCQ)}
                        >
                          Mcq ({single.total_mcq_assignments})
                        </div>
                      )}
                      {single?.total_assignments > 0 && (
                        <div
                          className={`flex flex-row items-center p-1 m-1 gap-2 px-2 text-xs h-6 w-auto bg-[#E6F0FF] rounded-[29px] border cursor-pointer ${
                            lessonFilter === LessonType.ASSIGNMENT
                              ? "border-blue-500"
                              : "hover:border-blue-500"
                          }`}
                          onClick={() => setLessonFilter(LessonType.ASSIGNMENT)}
                        >
                          Assignment ({single.total_assignments})
                        </div>
                      )}
                      {single?.total_text_contents > 0 && (
                        <div
                          className={`flex flex-row items-center p-1 m-1 gap-2 px-2 text-xs h-6 w-auto bg-[#E6F0FF] rounded-[29px] border cursor-pointer ${
                            lessonFilter === LessonType.TEXT
                              ? "border-blue-500"
                              : "hover:border-blue-500"
                          }`}
                          onClick={() => setLessonFilter(LessonType.TEXT)}
                        >
                          Reading ({single.total_text_contents})
                        </div>
                      )}
                    </div>
                  ) : null}

                  <LessonWeekTable
                    batchName={batchName}
                    sidePanel={false}
                    handleClose={handleClose}
                    loadingLesson={loadingLesson}
                    lessonFilter={lessonFilter}
                    lessons={single?.lessons}
                    currLesson={currLesson}
                  />
                </>
              )}
            </AccordionDetails>
          </MuiAccordion>
        ))
      )}

      <ToastContainer containerId={"contentId"} />
      <ToastContainer containerId={"contentId1"} />
    </>
  );
}
