import React from "react";
import { Card, CardContent, Typography, Button } from "@mui/material";
import usergroup from "../../assets/svg/user-group.svg";
import { useNavigate } from "react-router-dom";
import { AssessmentCardProps } from "../../_utils/interface";

export default function ManageAssessmentCard({
  assessment,
}: AssessmentCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="shadow-sm overflow-hidden">
      <CardContent className="p-4 h-auto flex flex-col justify-between">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <Typography
            variant="h6"
            className="text-base font-semibold leading-[22px] text-secondary-900"
          >
            {assessment.name}
          </Typography>
          <Button
            variant="outlined"
            sx={{
              border: "1px solid #001F68",
              color: "#001F68",
            }}
            onClick={() => {
              navigate(`/manage-assessment/${assessment.id}`, {
                state: assessment,
              });
            }}
          >
            View Details →
          </Button>
        </div>
        <div className="flex items-center mt-2">
          <div className="flex items-center bg-[#E6F0FF] rounded-full px-2 py-1">
            <img src={usergroup} alt="" className="w-4 h-4 mr-1" />
            <Typography className="text-xs font-medium text-secondary-600">
              Test taker {assessment.total_test_takers}
            </Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
