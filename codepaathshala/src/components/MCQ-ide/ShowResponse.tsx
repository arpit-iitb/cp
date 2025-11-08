import React, { useEffect, useState } from 'react';
import correctIcon from 'assets/svg/correctMCQ.svg';
import incorrectIcon from 'assets/svg/incorrectMCQ.svg';
import notSelected from 'assets/svg/notSelected.svg';
import { ShowResponseProps, Question } from '../../_utils/interface';
import { json } from 'd3-fetch';

function ShowResponse({ id, questions }: { id: string, questions: any }) {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    const mcqSelectedAnsString = localStorage.getItem(`selectedAnswers_${id}`);

    if (mcqSelectedAnsString) {
      const mcqSelectedAns = JSON.parse(mcqSelectedAnsString);
      setSelectedAnswers(mcqSelectedAns);
    }
  }, [id]);

  const isCorrectAnswer = (question: Question, choiceLabel: string) => {
    if (question.type === 'multi-correct') {
      const correctAnswers = question.correct_answer.split(',');
      return correctAnswers.includes(choiceLabel);
    } else {
      return choiceLabel === question.correct_answer;
    }
  };

  const isSelectedAnswer = (question: Question, choiceIndex: number) => {
    if (question.type === 'multi-correct') {
      return selectedAnswers['multi-correct']?.[question.questionNumber]?.includes(choiceIndex + 1);
    } else if (question.type === 'single-correct') {
      return selectedAnswers['single-correct']?.[question.questionNumber] === choiceIndex + 1;
    }
    return false;
  };

  return (
    <div>
      <div className="mb-2">
        <h2 className="font-semibold text-xl leading-4 text-secondary-500">Right answers to the MCQs</h2>
      </div>
      <div className="flex flex-col gap-4 bg-white p-5">
        {questions.map((question: Question, index: number) => (
          <div key={question.questionNumber} className="flex flex-col gap-3.5 border border-primary-100 rounded-lg p-4">
            <h3 className='mb-1'>{index + 1}.<span className='break-words' dangerouslySetInnerHTML={{ __html: question?.question_text ? question?.question_text : "" }}></span></h3>
            <ul className="pl-0 flex flex-col gap-2.5">
              {question.choices
                .filter(choice => choice !== "")
                .map((choice: string, choiceIndex: number) => {
                  const choiceLabel = String.fromCharCode(65 + choiceIndex);
                  let className = '';
                  let textColorClass = '';
                  let imgSrc = '';

                  if (isCorrectAnswer(question, choiceLabel)) {
                    textColorClass = 'text-[#10B981]';
                    imgSrc = correctIcon;
                  } else if (isSelectedAnswer(question, choiceIndex)) {
                    textColorClass = 'text-[#EF4444]';
                    imgSrc = incorrectIcon;
                  } else {
                    textColorClass = 'text-[#939393]';
                    imgSrc = notSelected;
                  }

                  return (
                    <li key={choiceLabel} className={`flex flex-row items-center gap-3 secondary-400 ${textColorClass}`}>
                      <label className="flex items-center gap-1.5 text-custom-sm leading-[15.6px] ">
                        {imgSrc && <img src={imgSrc} alt={className} className="w-3.5 h-3.5 inline-block" />}
                        <input
                          type={question.type === 'multi-correct' ? 'checkbox' : 'radio'}
                          className={`form-checkbox h-3.5 w-3.5`}
                          name={`question-${index}`}
                          value={choiceLabel}
                          checked={isSelectedAnswer(question, choiceIndex)}
                          readOnly
                        />
                        
                        {/* Localy created radio button and checkboxes based on figma
                        <span className={`w-3.5 h-3.5 border rounded-full flex items-center justify-center ${isSelectedAnswer(question, choiceIndex) ? 'border-blue-500' : 'border-black'}`}>
                          {isSelectedAnswer(question, choiceIndex) && (
                            <span className={`w-2.5 h-2.5 rounded-full ${isCorrectAnswer(question, choiceLabel) ? 'bg-[#3183FF]' : 'bg-[#3183FF]'}`}></span>
                            )}
                            </span> */}
                        {choice}
                      </label>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShowResponse;
