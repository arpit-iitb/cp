import React, { useState } from "react";
import { Card, Typography, Button } from "@mui/material";

export default function SaveCard(props: {
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [timecard, settimecard] = useState(false);
  const opentimecard = () => {
    settimecard(true);
  };

  return (
    <div className="fixed inset-0 flex justify-center pt-[25vh] bg-black bg-opacity-50 z-[10000]">
      <Card
        className="w-[25%] p-6 flex flex-col h-2/6 xl:h-32"
        sx={{ broderRadius: "100vh" }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "#001F68",
            marginBottom: "12px",
            marginTop: "-8px",
            fontWeight: "600",
            lineHeight: "25px",
          }}
          className="px-8 text-center mt-[-8px]"
        >
          Are you sure you want to save this assessment?
        </Typography>
        <div className="flex flex-row gap-4 w-full">
          <Button
            variant="outlined"
            color="primary"
            className="w-full"
            onClick={props.onClose}
            sx={{ borderRadius: "0.5rem" }}
          >
            Go Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            className="w-full"
            sx={{ borderRadius: "0.5rem" }}
            onClick={() => {
              props.onSubmit(); // Call the onSubmit function to trigger handleSubmit
            }}
          >
            Save
          </Button>
        </div>
      </Card>
    </div>
  );
}
