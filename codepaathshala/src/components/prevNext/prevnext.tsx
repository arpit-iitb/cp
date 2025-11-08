import { LessonType } from "_utils/enum";
import { useState } from "react";
import { Lesson, ProblemStateInterface } from "../../_utils/interface";
import { useNavigate } from "react-router-dom";
import PrevIcon from "assets/svg/prevIcon.svg";
import NextIcon from "assets/svg/nextIcon.svg"
import { useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ActionCreators } from "state/action-creators";
import { State } from "state/reducers";
import { Bounce, toast, ToastContainer } from "react-toastify";
import BackIcon from "assets/svg/Back.svg"
import { ApiConstants } from "_utils/api-constants";
import axiosHttp from "_utils/axios.index";
import { AxiosResponse } from "axios";
import LessonWeekTable from "components/LessonWeekTable/LessonWeekTable";
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from "@heroicons/react/24/outline";
import { Drawer, Box } from "@mui/material";
import "./prevnext.css";
import useCheckMobileScreen from "hooks/useCheckMobileScreen";

function PrevNext({ batchName, problem, type }: any) {
    const [loadingLesson, setLoadingLesson] = useState(false)
    const [lessons, setLessons] = useState<Lesson[] | null>(null);
    const [open, setOpen] = useState(false);

    const problemState = useSelector((state: State) => state.problemList);
    const dispatch = useDispatch();
    const { updateProblemList, setCurrentWeek } = bindActionCreators(ActionCreators, dispatch);
    let navigate = useNavigate();
    const isMobile = useCheckMobileScreen();
    const goToRegisterdBatches = () => {
        navigate(`/problems/${batchName}`)
    }


    const getWeeksLesson = (weekNum: number) => {
        setLoadingLesson(true);
        axiosHttp.get(ApiConstants.lessons.lessonList(weekNum, batchName))
            .then((res: AxiosResponse) => {
                setLessons(res.data.lessons)
                setLoadingLesson(false);
            })
            .catch((error: any) => {
                throw error;
            })
    }
    function handleRedirection(batchName: string, lesson: Lesson) {
        const { type, id, isFullStackProblem } = lesson
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
                navigate(`/problems/assignment/${batchName}/${id}`)
                break;
            case LessonType.MCQ:
                navigate(`/problems/mcq/${batchName}/${id}`)
                break;
            case LessonType.VIDEO:
                navigate(`/problems/video/${batchName}/${id}`)
                break;
        }
    }


    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };
    const DrawerList = (
        <Box className="mt-2" sx={{
            width: {
                md: "50vw",
                lg: "20vw"
            },
        }} role="presentation">
            <div className="px-3 md:px-4">
                {batchName && lessons ? <LessonWeekTable handleClose={toggleDrawer(false)} batchName={batchName} sidePanel={true} lessonFilter={null} lessons={lessons} loadingLesson={loadingLesson} weekNum={problem?.week_number} lessonId={problem.id} lessonType={problem.lesson_type} /> : null}
            </div>

        </Box>
    );
    function checkStateStatus() {
        if (!problemState || !problemState.problemList?.weekwise_data) {
            let cachedState: any = sessionStorage.getItem("cachedState");
            if (cachedState) {
                cachedState = JSON.parse(cachedState) as ProblemStateInterface;
                updateProblemList(cachedState.problemList);
                setCurrentWeek(cachedState.currentWeek);
            }
        }
    }

    const handlePrevQuestion = () => {
        checkStateStatus();
        if (problemState && problemState.problemList?.weekwise_data) {
            if (problemState.problemList.weekwise_data?.[problemState.currentWeek]) {
                problemState.problemList.weekwise_data?.[problemState.currentWeek]?.lessons?.forEach((lesson, index) => {
                    if (problem.title === lesson.title && type === lesson.type) {
                        if (index > 0) {
                            handleRedirection(batchName, problemState.problemList.weekwise_data?.[problemState.currentWeek]?.lessons[index - 1])
                        }
                        else {
                            toast.success("This is the first Problem of the Week.", {
                                position: "top-right",
                                closeOnClick: true,
                                pauseOnHover: true,
                                transition: Bounce,
                                theme: "colored"
                            });
                        }
                    }
                })
            }
        }
    }

    const handleNextQuestion = () => {
        checkStateStatus();
        if (problemState && problemState?.problemList && problemState?.problemList?.weekwise_data) {
            if (problemState.problemList.weekwise_data?.[problemState.currentWeek]) {
                let totalLessons = problemState.problemList.weekwise_data?.[problemState.currentWeek]?.lessons.length;
                problemState.problemList.weekwise_data?.[problemState.currentWeek]?.lessons?.forEach((lesson, index) => {

                    if (problem.title === lesson.title && type === lesson.type) {
                        if (index < totalLessons - 1) {
                            handleRedirection(batchName, problemState.problemList.weekwise_data?.[problemState.currentWeek]?.lessons[index + 1])
                        }
                        else {
                            toast.success("You have reached the last problem of the Week. You can now select Next Week Lessons to continue.", {
                                position: "top-right",
                                closeOnClick: true,
                                pauseOnHover: true,
                                transition: Bounce,
                                theme: "colored"
                            });
                        }
                    }
                })
            }
        }
    }
    return <>
        <ToastContainer />
        <div className="fixed left-0 top-[13rem] flex text-[#222] z-10">
            <div className="relative h-24 w-8 flex flex-col justify-center items-center cursor-pointer transform -skew-y-6" onClick={() => {
                toggleDrawer(true)();


                if (problem.week_number) {
                    getWeeksLesson(problem.week_number);
                }
            }}>
                <img src="/Rectangle.webp" alt="Parallelogram Shape" />
                <div className="absolute flex items-center justify-center text-secondary-500 text-md " style={{ writingMode: 'vertical-lr' }}>
                    <span>Week {problem?.week_number}</span>
                    <ChevronDoubleRightIcon className="h-6 w-6 text-secondary-500" />
                </div>
            </div>
        </div>
        <Drawer
            open={open}
            onClose={toggleDrawer(false)}
            PaperProps={{
                style: {
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                },
            }}
        >
            <div className="flex flex-col md:flex-row items-start h-full">
                <div className="bg-white h-screen overflow-y-auto overflow-x-hidden max-h-full w-full md:w-auto">
                    {DrawerList}
                </div>
                <div
                    className={`relative mt-3 h-24 w-8 z-10 flex flex-col justify-center items-center cursor-pointer top-20 md:top-20 ${isMobile ? "hidden" : ""}`}
                    onClick={toggleDrawer(false)}
                >
                    <img src="/Rectangle.webp" alt="Parallelogram Shape" />
                    <div
                        className="absolute flex items-center justify-center text-secondary-500 text-md "
                        style={{ writingMode: 'vertical-lr' }}
                    >
                        Week {problem?.week_number} <ChevronDoubleLeftIcon className="h-6 w-6 text-secondary-500" />
                    </div>
                </div>
            </div>
        </Drawer>


        <div className="flex justify-between gap-3 mb-2 mx-2 px-3">
            <p className="text-secondary-500 flex cursor-pointer " onClick={goToRegisterdBatches}>
                <img src={BackIcon} alt="Icon" className="me-3 mt-1 w-4 h-4" /> Back to Course
            </p>
            <div className="flex justify-end">
                {/* 6px, 8px, 6px, 4px */}
                <button className="pt-[4px] pr-[8px] pb-[4px] pl-[4px] bg-primary-50 border border-secondary-500 text-secondary-500 rounded-lg me-3 flex items-center gap-[4px]" onClick={handlePrevQuestion}>
                    <img src={PrevIcon} alt="icon" className="me-1" /> Previous
                </button>
                <button className="pt-[4px] pr-[8px] pb-[4px] pl-[8px] bg-primary-50 border border-secondary-500 text-secondary-500 rounded-lg flex items-center gap-[4px]" onClick={handleNextQuestion}>
                    Next <img src={NextIcon} alt="icon" className="ms-2 text-xl" />
                </button>
            </div>
        </div>

    </>
}
export default PrevNext;