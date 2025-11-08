import React from "react";
import { Card, Typography, Button } from "@mui/material";

export default function DeleteCard(props: {
  onClose: () => void;
  text: string;
}) {
  return (
    <>
      <div className="fixed inset-0 flex justify-center pt-[25vh] bg-black bg-opacity-50  h-full w-full">
        <Card
          className="w-[30vw] xl:w-[25vw] p-6 flex flex-col h-2/6 lg:h-[8.5rem]"
          sx={{ broderRadius: "100vh" }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#001F68",
              marginBottom: "20px",
              marginTop: "-8px",
              fontWeight: "600",
              lineHeight: "25px",
            }}
            className="px-8 text-center mt-[-8px]"
          >
            {/* Are you sure you want to Delete this section? */}
            {props.text}
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
              color="error"
              className="w-full"
              sx={{ borderRadius: "0.5rem" }}
              // onClick={opentimecard}
            >
              Delete
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
