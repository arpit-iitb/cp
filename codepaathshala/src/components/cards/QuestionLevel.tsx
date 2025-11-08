import React from "react";
import { Typography } from "@mui/material";
import { DifficultyLevelIcon } from "_utils/enum";
import { QuestionLevelProps } from "_utils/interface";

function QuestionLevel({
  easyCount,
  mediumCount,
  hardCount,
}: QuestionLevelProps) {
  return (
    <div className="rounded-xl p-4 max-h-[8.5rem] border border-[#D7E8FF]">
      <Typography
        variant="h6"
        sx={{
          fontSize: { xl: "14px", xs: "12px" },
          color: "#001F68",
        }}
        className=" text-secondary-500 font-[700] lg:text-lg border-b-2 pb-2 border-[#D7E8FF]"
      >
        No. of Questions in Levels
      </Typography>
      <div className="flex justify-evenly items-center mt-5 lg:mt-5">
        <Typography className="border-e-2 border-[#D7E8FF] flex flex-col items-center w-[30%]">
          <span className="flex flex-row text-sm xl:text-lg">
            <img
              src={DifficultyLevelIcon[1]}
              className="mr-1 w-[12.7px] h-[12.7px] xl:w-[16px] xl:h-[16px] mt-1"
              alt=""
            />
            Easy
          </span>
          <span className="font-[700] text-xl text-secondary-500">
            {easyCount}
          </span>
        </Typography>
        <Typography className="flex flex-col items-center w-[30%]">
          <span className="flex flex-row text-sm xl:text-lg">
            <img
              src={DifficultyLevelIcon[2]}
              // className="mr-1 w-[30%] h-[30%]"
              className="mr-1 w-[12.7px] h-[12.7px] xl:w-[16px] xl:h-[16px] mt-1"
              alt=""
            />
            Medium
          </span>
          <span className="font-[700] text-xl text-secondary-500">
            {mediumCount}
          </span>
        </Typography>
        <Typography className="border-s-2 border-[#D7E8FF] flex flex-col items-center w-[30%]">
          <span className="flex flex-row text-sm xl:text-lg">
            <img
              src={DifficultyLevelIcon[3]}
              className="mr-1 w-[12.7px] h-[12.7px] xl:w-[16px] xl:h-[16px] mt-1"
              // className="mr-1 w-[30%] h-[30%]"
              alt=""
            />
            Hard
          </span>
          <span className="font-[700] text-xl text-secondary-500">
            {hardCount}
          </span>
        </Typography>
      </div>
    </div>
  );
}

export default QuestionLevel;
