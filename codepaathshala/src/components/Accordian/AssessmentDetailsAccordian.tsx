import React, { useState } from "react";
import {
  Accordion as MuiAccordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AccordionProps } from "../../_utils/interface";

function Accordion(props: AccordionProps) {
  const { title, children, totalScore } = props;
  return (
    <MuiAccordion
      sx={{ border: "1px solid #D7E8FF", borderCollapse: "collapse" }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box className="flex justify-between w-full">
          <Typography className="font-bold text-sm lg:text-base">
            {title}
          </Typography>
          <Typography className="flex flex-row ">
            <div className="text-[#90A3C4] text-xs lg:text-sm ">
              Total Score
            </div>
            <div className="text-secondary-500 min-w-[28px] mr-3 font-bold text-sm justify-end flex lg:text-base">
              {totalScore}
            </div>
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </MuiAccordion>
  );
}

export default Accordion;
