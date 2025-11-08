export const LanguageOptions: { label: string; value: string }[] = [
  { label: "Select Language", value: "" },
  { label: "JavaScript", value: "javascript" },
  { label: "Python", value: "python" },
  { label: "Ruby", value: "ruby" },
  { label: "C", value: "c" },
  { label: "C++", value: "cpp" },
  { label: "Java", value: "java" },
  { label: "Go", value: "go" },
  { label: "Bash", value: "shell" },
  { label: "SQL", value: "sql" },
];
export const LanguageAssessmentOptions: { label: string; value: string }[] = [
  { label: "Select Language", value: "" },
  { label: "JavaScript", value: "javascript" },
  { label: "Python", value: "python" },
  // { label: "Ruby", value: "ruby" },
  // { label: "C", value: "c" },
  { label: "C++", value: "cpp" },
  { label: "Java", value: "java" },
  // { label: "Go", value: "go" },
  // { label: "Bash", value: "shell" },
  { label: "SQL", value: "sql" },
];
export const WeekOptions: { label: string; value: number }[] = [
  { label: "Week 1", value: 1 },
  { label: "Week 2", value: 2 },
  { label: "Week 3", value: 3 },
  { label: "Week 4", value: 4 },
  { label: "Week 5", value: 5 },
  { label: "Week 6", value: 6 },
  { label: "Week 7", value: 7 },
  { label: "Week 8", value: 8 },
  { label: "Week 9", value: 9 },
  { label: "Week 10", value: 10 },
  { label: "Week 11", value: 11 },
  { label: "Week 12", value: 12 },
  { label: "Week 13", value: 13 },
  { label: "Week 14", value: 14 },
  { label: "Week 15", value: 15 },
  { label: "Week 16", value: 16 },
  { label: "Week 17", value: 17 },
  { label: "Week 18", value: 18 },
  { label: "Week 19", value: 19 },
  { label: "Week 20", value: 20 },
  { label: "Week 21", value: 21 },
  { label: "Week 22", value: 22 },
  { label: "Week 23", value: 23 },
  { label: "Week 24", value: 24 },
  { label: "Week 25", value: 25 },
  { label: "Week 26", value: 26 },
  { label: "Week 27", value: 27 },
  { label: "Week 28", value: 28 },
  { label: "Week 29", value: 29 },
  { label: "Week 30", value: 30 },
];

export const steps = [
  "Choose Section Type",
  "Enter Section Details",
  "Enter Section Marks",
];

export const NUMERIC_REGEX = /^(0|[1-9][0-9]*)$/;
export const ALPHA_REGEX = /^[a-zA-Z]+$/;
export const EMAIL_REGEX = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
