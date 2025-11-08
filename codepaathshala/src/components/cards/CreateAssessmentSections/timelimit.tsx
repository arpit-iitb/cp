import React, { useState } from "react";
import {
  Card,
  Typography,
  TextField,
  Button,
  InputAdornment,
} from "@mui/material";
import SaveCard from "./save";
import { CreateAssessmentCardProps } from "_utils/interface";

const textFieldStyle = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#D7E8FF",
    },
    "&:hover fieldset": {
      borderColor: "#D7E8FF",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#D7E8FF",
    },
  },
  "& .MuiInputLabel-root": {
    color: "black",
    fontSize: "14px",
    transform: "translate(0, -24px) scale(1)",
  },
  "& .MuiInputBase-input::placeholder": {
    color: "#D7E8FF",
  },
};

export default function TimeCard(props: {
  onClose: () => void;
  onSave: (duration: string) => void;
}) {
  const handlesavecard = () => {
    const duration = String(Number(hours) * 60 + Number(minutes)); // Format the duration as needed
    props.onSave(duration); // Call the onSave function with the duration
    setsavecard(true); // Open the SaveCard
  };
  const [hours, setHours] = useState<number | string>("");
  const [minutes, setMinutes] = useState<number | string>("");
  const [savecard, setsavecard] = useState(false);
  const closesavecard = () => {
    setsavecard(false);
  };

  return (
    <div className="fixed inset-0 flex justify-center pt-[25vh] z-[10001]">
      <Card
        className="w-[25%] p-6 flex flex-col h-44"
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
          Enter the time for assessment
        </Typography>

        <div className="flex space-x-4">
          <TextField
            placeholder="Enter in HH"
            type="number"
            value={hours}
            onChange={(e) => {
              const value = e.target.value;
              setHours(value);
            }}
            sx={{
              ...textFieldStyle,
              width: "50%",
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ color: "black" }}>
                  Hrs
                </InputAdornment>
              ),
              inputProps: {
                min: 0,
                style: { textAlign: "left" },
              },
            }}
          />
          <TextField
            placeholder="Enter in MM"
            value={minutes}
            onChange={(e) => {
              const value = e.target.value;
              setMinutes(value);
            }}
            sx={{
              ...textFieldStyle,
              width: "50%",
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ color: "black" }}>
                  Mins
                </InputAdornment>
              ),
              inputProps: {
                min: 0,
                style: { textAlign: "left" },
              },
            }}
          />
        </div>

        <div className="flex flex-row gap-4 w-full mt-4">
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
            onClick={handlesavecard}
          >
            Save
          </Button>
        </div>
      </Card>
      {savecard && (
        <SaveCard onClose={closesavecard} onSubmit={handlesavecard} />
      )}
    </div>
  );
}
