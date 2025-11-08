import { useEffect, useState } from "react";
import { LessonType, examType } from "_utils/enum";
import axiosHttp from "_utils/axios.index";
import { ApiConstants } from "_utils/api-constants";
import { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import PrevNext from "components/prevNext/prevnext";
import { Modal, Button, Box } from '@mui/material';
import CongratulationIcon from "assets/svg/congrats.svg"
import PrevIcon from "assets/svg/prev-white.svg";
import NextIcon from "assets/svg/next-white.svg"
import Prism from "prismjs";
import "./Mcq.css";
import useCheckMobileScreen from "hooks/useCheckMobileScreen";
import ShowResponse from "./ShowResponse";

function McqIde({ quizData, id, batch, canSolve, weekNum, title, forTestYourUnderstanding = false, setResultSeen }: any) {
    let dataObj = {
        id:id,
        title: title,
        week_number: weekNum
    }
    const router = useNavigate();
    const isMobile = useCheckMobileScreen();
    const [activeQuestion, setActiveQuestion] = useState<number>(0);
    const [selectedAnswer, setSelectedAnswer] = useState<any>({});
    const [sideIndex, setSideIndex] = useState<number>(0);
    const [loading, setLoading] = useState(false)
    const [testResults, setTestResults] = useState(false)
    const [showResults, setShowResults] = useState<any>({})
    const [isModalOpen, setIsModalOpen] = useState(false);
    const goToRegisterdBatches = () => {
        router(`/problems/${batch}`)
    }

    useEffect(() => {
        Prism.highlightAll();
    }, [])
    useEffect(() => {
        setTestResults(false);
        setSelectedAnswer({});
        setSideIndex(0);
        setActiveQuestion(0);

        // Reset test results state
        setShowResults({});
    }, [id, batch, forTestYourUnderstanding])

    useEffect(() => {
        const McqSubmit = localStorage.getItem(`McqSubmit_${id}`);
        if (McqSubmit && forTestYourUnderstanding) {
            setTestResults(true);
            setShowResults(JSON.parse(localStorage.getItem(`McqSubmit_${id}`) || '{}'));
        }
    }, [id, batch, forTestYourUnderstanding])

    const question_text = quizData[sideIndex]?.question_text;
    const choices = quizData[sideIndex]?.choices;

    const onClickNext = () => {
        setSideIndex(sideIndex + 1)
        setActiveQuestion(sideIndex + 1)
    };

    const setDataIndex = (index: any) => {
        setSideIndex(index)
        setActiveQuestion(index)
    }

    const onClickPrevious = () => {
        setSideIndex(sideIndex - 1);
        setActiveQuestion(sideIndex - 1)
    }

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };
    const reattemptQuiz = (id: string) => {
        // Reset selected answers state
        setSelectedAnswer({});
        setSideIndex(0);
        setActiveQuestion(0);

        // Reset test results state
        setTestResults(false);
        setShowResults({});
    };

    const submitAssessment = () => {
        setLoading(true)
        setTestResults(false)
        setIsModalOpen(false);
        selectedAnswer["batch_name"] = batch;
        quizData?.forEach(async (single: any) => {
            console.info(quizData, selectedAnswer[examType.single]?.[single.questionNumber], 66)
            if (single?.type === "single-correct") {
                selectedAnswer[examType.single] = {
                    ...selectedAnswer[examType.single],
                    [single.questionNumber]: selectedAnswer[examType.single]?.[single.questionNumber] || ''
                };
            }
            if (single?.type === "multi-correct") {
                selectedAnswer[examType.multi] = {
                    ...selectedAnswer[examType.multi],
                    [single.questionNumber]: selectedAnswer[examType.multi]?.[single.questionNumber] || []
                };
            }
        });
        if (!selectedAnswer[examType.multi]) {
            selectedAnswer[examType.multi] = {}
        }
        if (!selectedAnswer[examType.single]) {
            selectedAnswer[examType.single] = {}
        }
        console.info(selectedAnswer, 86);
        localStorage.setItem(`selectedAnswers_${id}`, JSON.stringify(selectedAnswer));     
        //condition for offline/online evaluation 
        (forTestYourUnderstanding ?
            Offline_evaluation(id) :
            (() => {
                axiosHttp.post(ApiConstants.problems.submitMcqAssignment(id), selectedAnswer)
                    .then((res: AxiosResponse) => {
                        setShowResults(res.data);
                        setLoading(false);
                        setTestResults(true);
                        localStorage.setItem(`McqSubmit_${id}`, JSON.stringify(res.data));
                    });
            })()
        );

    }

    const Offline_evaluation = (id: string) => {
        let marksObtained = 0;
        let totalMarks = quizData.length;
        // Initialize objects to store correct and selected answers
        const correctAnswersObj: any = {};
        const selectedAnswersObj: any = {};
        quizData.forEach((single: any) => {
            correctAnswersObj[single.questionNumber] = single.correct_answer;
            if (single?.type === "single-correct") {
                const correctAnswer = single.correct_answer;
                const selectedOption = selectedAnswer[examType.single]?.[single.questionNumber];    
                const selectedOptionLetter = selectedOption ? String.fromCharCode(64 + selectedOption) : '';
                selectedAnswersObj[single.questionNumber] = selectedOptionLetter;    
                if (selectedOptionLetter === correctAnswer) {
                    marksObtained += 1;
                }
            }
                if (single?.type === "multi-correct") {
                const correctAnswers = single.correct_answer.split(','); // Assuming correct answers are stored as a comma-separated string
                const selectedOptions = selectedAnswer[examType.multi]?.[single.questionNumber] || [];
                const selectedOptionsLetters = selectedOptions.map((option: number) => String.fromCharCode(64 + option));
                selectedAnswersObj[single.questionNumber] = selectedOptionsLetters;
                    // Sort both arrays and compare
                if (JSON.stringify(correctAnswers.sort()) === JSON.stringify(selectedOptionsLetters.sort())) {
                    marksObtained += 1;
                }
            }
        });    
        const result = {
            success: true,
            marks_obtained: marksObtained,
            total_marks: totalMarks
        };
        localStorage.setItem(`McqSubmit_${id}`, JSON.stringify(result));
        const McqResult = JSON.parse(localStorage.getItem(`McqSubmit_${id}`) || '{}');
        setShowResults(McqResult);
        setLoading(false);
        setTestResults(true);
    };

    const onAnswerSelected = (answer: any, index: any) => {
        const currentQuestion = quizData[activeQuestion];

        if (currentQuestion?.type !== "single-correct") {
            // Multi-correct question type handling
            const selectedAnswers = selectedAnswer[examType.multi]?.[currentQuestion.questionNumber] || [];
            const updatedAnswers = selectedAnswers.includes(index)
                ? selectedAnswers.filter((selected: any) => selected !== index)
                : [...selectedAnswers, index];

            setSelectedAnswer((prev: any) => ({
                ...prev,
                [examType.multi]: {
                    ...prev[examType.multi],
                    [currentQuestion.questionNumber]: updatedAnswers
                }
            }));
        } else {
            // Single-correct question type handling
            setSelectedAnswer((prev: any) => ({
                ...prev,
                [examType.single]: {
                    ...prev[examType.single],
                    [currentQuestion.questionNumber]: index
                }
            }));
        }
    };


    const clearResponse = () => {
        const updatedAnswers = { ...selectedAnswer };
        const currentQuestion = quizData[activeQuestion];

        if (currentQuestion?.type === "single-correct") {
            if (updatedAnswers[examType.single] && updatedAnswers[examType.single][currentQuestion?.questionNumber] !== null) {
                updatedAnswers[examType.single][currentQuestion?.questionNumber] = null;
                setSelectedAnswer(updatedAnswers);
            }
        } else if (currentQuestion?.type === "multi-correct") {
            if (updatedAnswers[examType.multi] && updatedAnswers[examType.multi][currentQuestion?.questionNumber] !== null) {
                updatedAnswers[examType.multi][currentQuestion?.questionNumber] = null;
                setSelectedAnswer(updatedAnswers);
            }
        }
    };

    //const addLeadingZero = (number: any) => (number > 9 ? number : `0${number}`);
    const getCard = () => {
        return <>
            <div className="w-full grid grid-cols-12 items-center gap-4 ml-2 mb-3">
                {quizData?.map((question: any, index: any) => (
                    <div
                        key={index}
                        onClick={(e) => setDataIndex(index)}
                        className={`w-8 h-8 cursor-pointer border col-span-2 flex justify-center items-center rounded border-[#001F68] text-[#001F68] ${sideIndex === index ? 'bg-[#EFF4FF]' : ''} gap-4 mb-4`}
                        style={{ minWidth: '2rem' }}
                    >
                        {index + 1}
                    </div>
                ))}
            </div>


        </>


    };
    return <>
        {!loading ? (
            <>
                {(!forTestYourUnderstanding) &&
                    <PrevNext batchName={batch} problem={dataObj} type={LessonType.MCQ} />
                }
                {!testResults ? (
                    <>

                        <div className="grid grid-cols-12 mt-6 mx-2 gap-3 mb-3 px-3">
                            <div className="col-span-12 lg:col-span-3">
                                <div className="border border-primary-50 rounded-xl p-3 h-98">
                                    <div className="p-3 mx-2">
                                        <h3 className="font-bold text-xl">Questions</h3>
                                        <hr className="bg-primary-50 rounded-xl mt-3" />
                                    </div>
                                    <div className="mt-3 mx-2">
                                        {getCard()}
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-9 border border-primary-50 rounded-xl p-3">
                                <div className="quiz-container mx-3 flex flex-col h-full sm:!h-96 justify-between">
                                    <div className="mt-3">
                                        <div className="p-2">
                                            <h3 className="font-bold mb-4 text-xl text-[#001F68]" style={{ whiteSpace: 'pre-wrap', fontWeight: 'bold' }} dangerouslySetInnerHTML={{ __html: question_text }}></h3>
                                            <ul>
                                                {choices?.map((answer: any, index: any) => (
                                                    (answer !== "" && answer !== undefined) && (
                                                        <li
                                                            key={index + 1}
                                                            className={`px-3 cursor-pointer transition-colors duration-300 ${selectedAnswer[examType.multi]?.[quizData[activeQuestion]?.questionNumber]?.includes(index + 1) || selectedAnswer[examType.single]?.[quizData[activeQuestion]?.questionNumber] === index + 1 ? "!text-secondary-500" : "!text-[#939393]"}`}
                                                        >
                                                            <label className="flex items-center">
                                                                {quizData[activeQuestion].type === 'single-correct' ? (
                                                                    <input
                                                                        type="radio"
                                                                        value={index + 1}
                                                                        className="form-radio h-4 w-4 transition duration-150 ease-in-out mr-2"
                                                                        onChange={() => onAnswerSelected(answer, index + 1)}
                                                                        checked={selectedAnswer[examType.single]?.[quizData[activeQuestion]?.questionNumber] === index + 1}
                                                                    />
                                                                ) : (
                                                                    <input
                                                                        type="checkbox"
                                                                        value={index + 1}
                                                                        className="form-checkbox h-4 w-4 transition duration-150 ease-in-out mr-2"
                                                                        onChange={() => onAnswerSelected(answer, index + 1)}
                                                                        checked={selectedAnswer[examType.multi]?.[quizData[activeQuestion]?.questionNumber]?.includes(index + 1)}
                                                                    />
                                                                )}
                                                                <span className="text-lg" style={{ whiteSpace: 'pre-wrap' }}>{answer}</span>
                                                            </label>
                                                        </li>
                                                    )
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-between gap-3 mt-3 sm:mt-5">
                                        <button onClick={clearResponse} className="text-[#3183FF] border border-[#3183FF] bg-primary-50 px-3 py-1 rounded">
                                            {isMobile ? "Clear Res" : "Clear Response"}
                                        </button>
                                        <div className="flex justify-end">
                                            <button onClick={onClickPrevious} disabled={activeQuestion === 0} className={`ml-3 ${activeQuestion === 0 ? 'hidden' : ''} bg-[#001F68] text-white px-3 py-1 rounded flex items-center ${!isMobile ? "me-3" : "me-1"}`}>
                                                <img src={PrevIcon} alt="Previous Icon" className="mr-1 h-4 w-4 !text-white" /> {isMobile ? "Prev Que" : "Previous Question"}
                                            </button>
                                            <button onClick={onClickNext} disabled={activeQuestion === quizData.length - 1} className={`ml-auto ${activeQuestion === quizData.length - 1 ? 'hidden' : ''} bg-[#001F68] text-white px-3 py-1 rounded flex items-center`}>
                                                {isMobile ? "Next Que" : "Next Question"} <img src={NextIcon} alt="Next Icon" className="ml-2 h-4 w-4 !text-white" />
                                            </button>
                                            <button onClick={handleOpenModal} disabled={activeQuestion !== quizData.length - 1 || !canSolve} className={`ml-3 bg-primary-500 text-white font-bold px-3 py-1 px-4 rounded ${activeQuestion !== quizData.length - 1 ? 'hidden' : ''}`}>
                                                Submit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </>
                ) : (
                    <>
                        <div
                            className="flex flex-col p-6 w-1/2 mx-auto justify-center items-center">
                            <ul className="text-center">

                                <li className="flex justify-center items-center"><img src={CongratulationIcon} alt="icon" /></li>
                                <li className="text-3xl text-secondary-500">Assessment Submitted Successfully!!</li>
                                <li>Marks Obtained: <span
                                    className="font-bold text-xl text-green-800"> {showResults?.marks_obtained}<span className="!text-gray-900">/ {showResults?.total_marks}</span></span>
                                </li>
                            </ul>
                            {
                                forTestYourUnderstanding ? (
                                    <>
                                        <div className="flex gap-12 w-auto">
                                            <button
                                                onClick={() => reattemptQuiz(id)}
                                                className="mt-4 bg-primary-500 hover:bg-primary-700 text-white py-2 px-4 rounded"
                                            >
                                                Re-Attempt
                                            </button>
                                            <button
                                                onClick={() => { setResultSeen(true); }}
                                                className="mt-4 bg-primary-500 hover:bg-primary-700 text-white py-2 px-4 rounded"
                                            >
                                                Show Responses
                                            </button>
                                        </div>

                                    </>
                                ) : (
                                    <>
                                        <button onClick={goToRegisterdBatches}
                                            className="mt-4 bg-primary-500 hover:bg-primary-70 text-white py-2 px-4 rounded">
                                            Back to Course
                                        </button>
                                        {/* <div className="seperator-line"></div> */}
                                    </>
                                )
                            }

                        </div>
                        {(!forTestYourUnderstanding) &&
                            <div className="flex justify-center">
                                <div className="w-full max-w-screen-lg px-4 sm:px-6 lg:px-8">
                                    <div className="h-0.5 border-2 border-primary-100 mx-auto mt-2"></div>
                                    <br></br>
                                    <ShowResponse id={id} questions={quizData} />
                                </div>
                            </div>




                        }
                    </>
                )}
            </>
        ) : (
            <>
                <div className="flex flex-col items-center bg-white-200 rounded-lg shadow-lg p-6">
                    <ul className="text-gray-800">
                        <li>Analyzing your result Please wait!</li>
                    </ul>
                </div>
            </>
        )
        }

        <Modal
            open={isModalOpen}
            onClose={handleCloseModal}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            sx={{
                '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '& fieldset': {
                        borderColor: '#AFD0FF',
                    },
                    '&:hover fieldset': {
                        borderColor: '#AFD0FF',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#AFD0FF',
                    },
                },
            }}
        >
            <Box sx={{ width: isMobile ? "90%" : '50%', maxWidth: isMobile ? "500px" : "400px", mx: 'auto', my: '30vh', p: '2rem', background: "#FFFFFF" }}>
                <div className="text-secondary-500 text-xl font-bold flex justify-center mb-4">
                    Are you sure you want to submit the MCQ Assignment?
                </div>
                <div className="flex space-x-4 items-center justify-center">
                    <button className="text-primary-500 border border-primary-500 p-2 rounded-xl" onClick={handleCloseModal}>
                        Go Back
                    </button>

                    <button className="text-white bg-primary-500 p-2 rounded-xl" onClick={submitAssessment}>
                        Submit
                    </button>
                </div>
            </Box>
        </Modal >
    </>

}

export default McqIde;