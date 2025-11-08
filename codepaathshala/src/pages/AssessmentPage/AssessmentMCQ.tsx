import { useState, useEffect } from "react";
import {
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup,
    Radio,
    RadioGroup,
} from "@mui/material";
import PrevIcon from "assets/svg/prev-white.svg";
import NextIcon from "assets/svg/next-white.svg";
import { AssessmentMCQProps } from "../../_utils/interface";
import { AssessmentType } from "_utils/enum";

export default function AssessmentMCQ({
    question,
    onUpdateQuestion,
    title,
    onNext,
    onPrevious,
    disableNext,
    disablePrevious,
    onAnswerSelected,
}: AssessmentMCQProps) {
    // State to store selected answers dynamically
    const initialSelectedAnswers = JSON.parse(localStorage.getItem("selectedAnswers") || "{}");
    const [selectedAnswers, setSelectedAnswers] = useState<any>(initialSelectedAnswers);

    // Handle selecting answers
    const handleSelectAnswer = (answer: string, questionId: string, isMultiple: boolean) => {
        setSelectedAnswers((prevAnswers: any) => {
            const currentSelection = prevAnswers[title]?.answers?.[questionId] || [];

            if (isMultiple) {
                const updatedSelection = currentSelection.includes(answer)
                    ? currentSelection.filter((selected: string) => selected !== answer)
                    : [...currentSelection, answer];

                return {
                    ...prevAnswers,
                    [title]: {
                        ...prevAnswers[title],
                        type: AssessmentType.MCQ,
                        answers: {
                            ...prevAnswers[title]?.answers,
                            [questionId]: updatedSelection,
                        }
                    },
                };
            } else {
                return {
                    ...prevAnswers,
                    [title]: {
                        ...prevAnswers[title],
                        type: AssessmentType.MCQ,
                        answers: {
                            ...prevAnswers[title]?.answers,
                            [questionId]: prevAnswers[title]?.answers?.[questionId] === answer ? "" : answer,
                        }
                    },
                };
            }
        });
    };

    // Flag the current question
    const handleFlagged = () => {
        onUpdateQuestion(question);
    };

    // Clear the response for the current question
    const handleClearResponse = (questionId: string, isMultiple: boolean) => {
        setSelectedAnswers((prevAnswers: any) => ({
            ...prevAnswers,
            [title]: {
                ...prevAnswers[title],
                answers: {
                    ...prevAnswers[title]?.answers,
                    [questionId]: isMultiple ? [] : "",
                },
            },
        }));
    };

    // Save selected answers to session storage and notify parent component
    useEffect(() => {
        localStorage.setItem("selectedAnswers", JSON.stringify(selectedAnswers));
        onAnswerSelected(selectedAnswers);
    }, [selectedAnswers]);

    return (
        <>
            <div className="max-h-[70vh] h-80 overflow-y-auto">
                <p className="text-[#001F68] font-semibold text-xl mb-4 break-words" style={{ whiteSpace: "pre-wrap" }} dangerouslySetInnerHTML={{ __html: question.question_text || "" }}></p>
                <div className="mb-4">
                    {question.is_multiple === "true" ? (
                        <FormControl variant="standard">
                            <FormGroup>
                                {question.options?.map((option, index) => (
                                    option.label !== "" &&
                                    option.value !== "" && (
                                        <FormControlLabel
                                            key={index}
                                            value={option.value}
                                            checked={selectedAnswers[title]?.answers?.[question.id]?.includes(option.value) || false}
                                            onChange={() => handleSelectAnswer(option.value, question.id, true)}
                                            control={<Checkbox className="text-primary-400" />}
                                            className={`px-3 cursor-pointer transition-colors duration-300 ${selectedAnswers[title]?.answers?.[question.id]?.includes(option.value) ? "text-secondary-500" : "text-[#939393]"}`}
                                            label={
                                                <span
                                                    dangerouslySetInnerHTML={{ __html: option.label ? option.label : "" }}
                                                />
                                            }
                                        />
                                    )
                                ))}
                            </FormGroup>
                        </FormControl>
                    ) : (
                        <FormControl>
                            <RadioGroup aria-labelledby="demo-controlled-radio-buttons-group" name="controlled-radio-buttons-group">
                                {question.options?.map((option, index) => (
                                    option.label !== "" &&
                                    option.value !== "" && (
                                        <FormControlLabel
                                            key={index}
                                            value={option.value}
                                            checked={selectedAnswers[title]?.answers?.[question.id] === option.value}
                                            onChange={() => handleSelectAnswer(option.value, question.id, false)}
                                            control={<Radio className="text-primary-400" />}
                                            className={`px-3 cursor-pointer transition-colors duration-300 ${selectedAnswers[title]?.answers?.[question.id] === option.value ? "text-secondary-500" : "text-[#939393]"}`}
                                            label={
                                                <span
                                                    dangerouslySetInnerHTML={{ __html: option.label ? option.label : "" }}
                                                />
                                            }
                                        />
                                    )
                                ))}
                            </RadioGroup>
                        </FormControl>
                    )}

                </div>
            </div>
            <div className="flex justify-between items-center mt-6 gap-3">
                <div>
                    <Button
                        onClick={handleFlagged}
                        variant="outlined"
                        className="!border !border-orange-400 !text-orange-400 !bg-[#FFF4EB] !rounded-xl !normal-case !me-2"
                    >
                        Flag
                    </Button>
                    <Button
                        onClick={() => handleClearResponse(question.id, question.is_multiple === "true")}
                        variant="outlined"
                        className="text-[#3183FF] border border-[#3183FF] !bg-[#E6F0FF] !rounded-xl !normal-case"
                    >
                        Clear Response
                    </Button>
                </div>
                <div>
                    {!disablePrevious && (
                        <Button
                            onClick={onPrevious}
                            className="!me-3 !rounded-xl !normal-case !bg-secondary-500 !text-white !p-2"
                        >
                            <img
                                src={PrevIcon}
                                alt="Previous Icon"
                                className="mr-1 h-4 w-4 !text-white"
                            />{" "}
                            Previous
                        </Button>
                    )}
                    {!disableNext && (
                        <Button
                            onClick={onNext}
                            className="!rounded-xl !ml-3 !normal-case !bg-secondary-500 !text-white !p-2"
                        >
                            Next{" "}
                            <img
                                src={NextIcon}
                                alt="Next Icon"
                                className="ml-2 h-4 w-4 !text-white"
                            />
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
}
