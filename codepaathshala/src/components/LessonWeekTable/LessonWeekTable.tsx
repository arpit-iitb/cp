// This component is used in the problemlist( to display all the lessons of a given week) and as side panel for all lesson type ides the

import { Lesson } from "../../_utils/interface";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
} from "@mui/material";
import { LessonType, ProblemStatus } from "../../_utils/enum";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import {
  CommandLineIcon,
  DocumentTextIcon,
  ListBulletIcon,
  VideoCameraIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { BoltIcon } from "@heroicons/react/24/solid";
import useCheckMobileScreen from "hooks/useCheckMobileScreen";

export default function LessonWeekTable({
  batchName,
  sidePanel,
  handleClose,
  loadingLesson,
  lessonFilter,
  lessons,
  weekNum,
  lessonId,
  lessonType,
}: {
  batchName: string;
  sidePanel: boolean;
  handleClose?: any;
  loadingLesson?: boolean;
  lessonFilter: LessonType | null;
  lessons: Lesson[];
  currLesson?: number | null;
  weekNum?: number | null;
  lessonId?: number | null;
  lessonType?: string | null;
}) {
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

  const isMobile = useCheckMobileScreen();

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
  const navigate = useNavigate();

  return (
    <>
      {sidePanel && weekNum ? (
        <h3 className=" font-semibold text-left text-secondary-500">
          Week {weekNum}
        </h3>
      ) : null}
      <TableContainer elevation={0} component={Paper}>
        <Table size="medium" aria-label="a dense table">
          <TableBody>
            {loadingLesson
              ? // Render loading skeleton rows
                [...Array(6)].map((_, index) => (
                  <TableRow
                    key={index}
                    className={`!py-12 bg-gray-200 !border-1 animate-pulse ${
                      sidePanel ? "!h-screen" : ""
                    }`}
                  >
                    <TableCell className="w-full"></TableCell>
                  </TableRow>
                ))
              : // Render actual lesson rows
                (filterLessons(lessons, lessonFilter) || []).map(
                  (lesson, index) => (
                    <TableRow key={index}>
                      <TableCell
                        sx={{
                          fontSize: "inherit",
                          borderStyle: "solid",
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderBottomColor: "rgba(217,232,255,1)",
                          padding: "12px", // Adjust padding as needed
                        }}
                      >
                        <div
                          className={`flex items-center gap-4 w-full ${
                            sidePanel && Number(lessonId) === Number(lesson.id)
                              ? "bg-primary-50 p-1 "
                              : ""
                          }`}
                        >
                          {/* Render difficulty level icon */}
                          {lesson.difficulty_level === 1 ? (
                            <Tooltip title={"Easy"}>
                              <img
                                src="/icons/Difficuilty/Easy.webp"
                                className="h-6 w-6"
                                alt="Easy"
                              />
                            </Tooltip>
                          ) : lesson.difficulty_level === 2 ? (
                            <Tooltip title="Medium">
                              <img
                                src="/icons/Difficuilty/Medium.webp"
                                className="h-6 w-6"
                                alt="Medium"
                              />
                            </Tooltip>
                          ) : (
                            <Tooltip title="Hard">
                              <img
                                src="/icons/Difficuilty/Hard.webp"
                                className="h-6 w-6"
                                alt="Hard"
                              />
                            </Tooltip>
                          )}

                          {/* Render lesson type icon */}
                          {lesson.type === LessonType.PROBLEM ? (
                            <Tooltip title="Coding Problem">
                              <CommandLineIcon
                                className={`h-6 w-6 ${
                                  lessonType &&
                                  lessonId &&
                                  lessonType == lesson.type &&
                                  lessonId?.toString() == lesson.id
                                    ? "text-primary-500"
                                    : "text-secondary-500"
                                }`}
                              />
                            </Tooltip>
                          ) : lesson.type === LessonType.VIDEO ? (
                            <Tooltip title="Video">
                              <VideoCameraIcon
                                className={`h-6 w-6 ${
                                  lessonType &&
                                  lessonId &&
                                  lessonType == lesson.type &&
                                  lessonId?.toString() == lesson.id
                                    ? "text-primary-500"
                                    : "text-secondary-500"
                                }`}
                              />
                            </Tooltip>
                          ) : lesson.type === LessonType.MCQ ? (
                            <Tooltip title="MCQ">
                              <ListBulletIcon
                                className={`h-6 w-6 ${
                                  lessonType &&
                                  lessonId &&
                                  lessonType == lesson.type &&
                                  lessonId?.toString() == lesson.id
                                    ? "text-primary-500"
                                    : "text-secondary-500"
                                }`}
                              />
                            </Tooltip>
                          ) : lesson.type === LessonType.ASSIGNMENT ? (
                            <Tooltip title="Assignment">
                              <DocumentTextIcon
                                className={`h-6 w-6 ${
                                  lessonType &&
                                  lessonId &&
                                  lessonType == lesson.type &&
                                  lessonId?.toString() == lesson.id
                                    ? "text-primary-500"
                                    : "text-secondary-500"
                                }`}
                              />
                            </Tooltip>
                          ) : (
                            <Tooltip title="Reading Material">
                              <DocumentTextIcon
                                className={`h-6 w-6 ${
                                  lessonType &&
                                  lessonId &&
                                  lessonType == lesson.type &&
                                  lessonId?.toString() == lesson.id
                                    ? "text-primary-500"
                                    : "text-secondary-500"
                                }`}
                              />
                            </Tooltip>
                          )}

                          {/* Render lesson title */}
                          <span
                            className={`cursor-pointer gap-4 hover:underline ${
                              lessonType &&
                              lessonId &&
                              lessonType == lesson.type &&
                              lessonId?.toString() == lesson.id
                                ? "text-primary-500"
                                : "text-secondary-500"
                            }`}
                            onClick={() => handleRedirection(batchName, lesson)}
                          >
                            {sidePanel ? (
                              <>
                                {lesson.title?.length > 20 ? (
                                  <>
                                    <Tooltip title={lesson.title}>
                                      {/* @ts-ignore */}
                                      {lesson.title?.substring(0, 20) + "..."}
                                    </Tooltip>
                                  </>
                                ) : (
                                  <>{lesson.title}</>
                                )}
                              </>
                            ) : (
                              <>
                                {isMobile ? (
                                  <>
                                    {lesson.title?.length > 20 ? (
                                      <>
                                        <Tooltip title={lesson.title}>
                                          {/* @ts-ignore */}
                                          {lesson.title?.substring(0, 20) +
                                            "..."}
                                        </Tooltip>
                                      </>
                                    ) : (
                                      <>{lesson.title}</>
                                    )}
                                  </>
                                ) : (
                                  <>{lesson.title}</>
                                )}
                              </>
                            )}
                          </span>

                          {/* Render attempts or video duration */}
                          {lesson.type === LessonType.VIDEO ? (
                            <span
                              className={`text-[#939393] text-xs font-light ${
                                sidePanel || isMobile ? "ml-auto" : ""
                              }`}
                            >
                              {lesson.video_duration
                                ? convertDuration(lesson.video_duration)
                                : ""}
                            </span>
                          ) : lesson.attempts ? (
                            <span className="flex items-center p-1 m-1 gap-2 px-2 text-xs h-6 w-auto bg-[#E6F0FF] rounded-[29px] text-secondary-500">
                              {`${lesson.attempts} attempts left`}
                            </span>
                          ) : null}

                          {lesson.status === ProblemStatus.COMPLETED ? (
                            <CheckCircleIcon
                              className={`h-6 w-6 text-green-500 ${
                                sidePanel || isMobile ? "ml-auto" : ""
                              }`}
                            />
                          ) : lesson.status === ProblemStatus.PENDING ? (
                            <ClockIcon
                              className={`h-6 w-6 text-yellow-500 ${
                                sidePanel || isMobile ? "ml-auto" : ""
                              } `}
                            />
                          ) : null}
                        </div>

                        {!sidePanel && (
                          <div className="ml-auto flex justify-end">
                            <div className="grid grid-cols-3 gap-1 items-center">
                              <div className="col-span-1">
                                <BoltIcon className="h-5 w-5 text-[#f9cd0c]" />
                              </div>
                              <div className="col-span-2">
                                <span className="text-sm text-gray-600">
                                  {lesson.maximum_possible_score &&
                                  lesson.maximum_possible_score > 0 ? (
                                    <span>{`${lesson.score}/${lesson.maximum_possible_score}`}</span>
                                  ) : (
                                    <span>-</span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
