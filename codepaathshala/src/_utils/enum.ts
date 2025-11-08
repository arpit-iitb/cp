export enum LessonType {
  PROBLEM = "P",
  VIDEO = "V",
  ASSIGNMENT = "A",
  MCQ = "M",
  FULLSTACK = "F",
  TEXT = "T",
}
export enum Logo {
  capabl = "https://capabl.in/Capabl%20Logo-01.png",
  beep = "https://www.eventbeep.com/assets/beepLogoWhite.svg",
}

export enum ProblemStatus {
  COMPLETED = "completed",
  UNSOLVED = "unsolved",
  PENDING = "pending",
}
export enum examType {
  mcq = "multiple-choice",
  coding = "coding-problem",
  descriptive = "descriptive",
  single = "single-correct",
  multi = "multi-correct",
  subjective = "subjective",
}

export enum AssessmentStatus {
  NOT_ATTEMPTED = "Not_Attempted",
  FAILED = "Failed",
  PASSED = "Passed",
}

export const LessonTypeText = {
  P: "Problem",
  V: "Video",
  A: "Assignment",
  M: "MCQ",
  F: "Fullstack",
};

export const DifficultyLevelIcon = {
  1: "/icons/Difficuilty/Easy.webp",
  2: "/icons/Difficuilty/Medium.webp",
  3: "/icons/Difficuilty/Hard.webp",
};
export const DifficultyLevel = {
  1: "Easy",
  2: "Medium",
  3: "Hard",
};
export const DifficultyScore = {
  1: 50,
  2: 100,
  3: 150,
};
export enum SnackBarSeverityLevel {
  SUCCESS = "success",
  WARNING = "warning",
  INFO = "info",
  ERROR = "error",
}

export enum UserType {
  STUDENT = "student",
  ADMIN = "admin",
}

export enum UserPermissions {
  ADD,
  EDIT,
  DELETE,
}
export const McqAnswers = {
  0: "A",
  1: "B",
  2: "C",
  3: "D",
};

export enum AssessmentType {
  MCQ = "mcq",
  CODING = "coding",
  SUBJECTIVE = "subjective",
}

export enum FaceDetectionEnum {
  NO_FACE = "NO_FACE",
  MULTIPLE_FACES = "MULTIPLE_FACES",
}
