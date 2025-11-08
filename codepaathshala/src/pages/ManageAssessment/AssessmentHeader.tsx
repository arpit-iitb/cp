import React from "react";
import { Button, Typography, Box } from "@mui/material";
import back from "../../assets/svg/Back-arrow.svg";
import user from "../../assets/svg/user.svg";
import description from "../../assets/svg/descritpion.svg";
import option from "../../assets/svg/option-3-lines-with-dots.svg";
import recycle from "../../assets/svg/recycle.svg";
import exp from "../../assets/svg/export.svg";
import DataCard from "../../components/cards/dataCard";
import { AdminCardDataInterface } from "../../_utils/interface";
import { AssessmentHeaderProps } from "../../_utils/interface";
import { Link } from "react-router-dom";

export default function AssessmentHeader(props: AssessmentHeaderProps) {
  const {
    title,
    numberofQues,
    averageAttempts,
    averageMarks,
    total_submission,
  } = props;
  const cardData: AdminCardDataInterface[] = [
    {
      title: "Number of Students",
      icon: user,
      tooltip: "",
      data: total_submission,
    },
    {
      title: "Average Marks",
      icon: description,
      tooltip: "",
      // To confirm the format for display
      // data: averageMarks ? `${averageMarks.toFixed(2)}/100` : "N/A",
      data: averageMarks === null ? "N/A" : `${Math.round(averageMarks)}/100`,
    },
    {
      title: "No. of Questions",
      icon: option,
      tooltip: "",
      data: numberofQues === null ? "N/A" : numberofQues.toString(),
    },
    {
      title: "Average Attempts",
      icon: recycle,
      tooltip: "",
      data: averageAttempts ? `${averageAttempts.toFixed(2)}` : "N/A",
    },
  ];

  console.info(numberofQues);

  return (
    <div className="mb-10 mt-[-6vh] lg:mt-0 lg:p-5">
      <Box className="flex justify-between items-center p-4">
        <Link to="/manage-assessment">
          <div className="flex items-center text-[5px]">
            <img src={back} className="h-[24px] mr-2" alt="" />
            <Typography
              variant="h4"
              sx={{
                color: "#001F68",
                fontSize: { lg: "32px", sm: "28px", xs: "5vw" },
                fontWeight: "600",
              }}
            >
              {title}
            </Typography>
          </div>
        </Link>
        <div>
          <Button
            variant="outlined"
            sx={{ mr: 2, borderColor: "#3183FF", color: "#3183FF" }}
          >
            Export CSV
            <img src={exp} className="ml-1" alt="" />
          </Button>
          <Button variant="contained" sx={{ backgroundColor: "#3183FF" }}>
            Edit Assessment
          </Button>
        </div>
      </Box>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3 mx-3 xs:grid-cols-1">
        {cardData &&
          cardData.map((single, index) => (
            <div
              key={index}
              className="shadow-[#D7E8FF] shadow rounded-xl border-[#D7E8FF]"
            >
              <DataCard key={index} {...single} />
            </div>
          ))}
      </div>
    </div>
  );
}
