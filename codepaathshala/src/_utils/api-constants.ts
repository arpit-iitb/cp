import { LessonType } from "./enum";

export const ApiConstants = {
  baseApiUrl: process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/",
  baseSocketUrl: process.env.REACT_APP_SOCKET_URL || "127.0.0.1:8000",
  accounts: {
    register: "accounts/register/",
    login: "accounts/login/",
    profileDetails: "accounts/profile/",
    assosiatedBatches: "api/my-courses",
    changePassword: "accounts/change-password/",
    resetPassword: "accounts/set-new-password/",
    sendOTP: "accounts/reset-password/",
  },
  problems: {
    video: (batchName: string, id: any) =>
      `api/video-lectures/?video_lecture_id=${id}&batch_name=${batchName}`,
    mcqQuestions: (id: any) => `api/get-practice-questions/?video_id=${id}`,
    problems: (batchName: any, id: any) =>
      `api/problem/?batch_name=${batchName}&problem_id=${id}`,
    submitfullStack: (batchName: any, id: any) =>
      `submit/frontend-evaluation/create-submission/?batch_name=${batchName}&problem_id=${id}`,
    lastSubmission: (id: any) =>
      `submit/problem/last-submission/?problem_id=${id}`,
    prevAssignmentSubmission: (id: any) =>
      `submit/assignment/last-submissions/?assignment_id=${id}`,
    runCode: (batchName: any, id: any) =>
      `submit/problem/compile-run/?problem_id=${id}&batch_name=${batchName}`,
    submitCode: (batchName: any, id: any) =>
      `submit/problem/create-submission/?problem_id=${id}&batch_name=${batchName}`,
    submitAssessementCode: (batchName: any, id: any) =>
      `submit/assessment/problem/create-submission/?problem_id=${id}&batch_name=${batchName}`,
    videos: (batchName: string, id: string) =>
      `api/video-lectures/?batch_name=${batchName}&video_lecture_id=${id}`,
    getVideoWatched: (id: any) => `submit/video/view-watched/?video_id=${id}`,
    markVideoWatched: (id: any) =>
      `submit/video/marked-as-watched/?video_id=${id}`,
    assignments: (batchName: string, id: string) =>
      `api/assignments/?batch_name=${batchName}&assignment_id=${id}`,
    assignmentsFileUpload: () => `submit/assignment/upload-submission/`,
    assignmentsOpenFileUpload: () =>
      `submit/open-assignment/upload-submission/`,
    submitAssignment: (batchName: any, id: any) =>
      `submit/assignment/create-submission/?assignment_id=${id}&batch_name=${batchName}`,
    mcqassignment: (batchName: any, id: any) =>
      `api/mcq-assignment/?batch_name=${batchName}&mcq_assignment_id=${id}`,
    submitAssessments: (id: any) =>
      `api/assessment/create-submission/?assessment_id=${id}`,
    sumitOpenAssessment: (id: any) =>
      `/api/assessment/create-open-assessment-submission/?assessment_id=${id}`,
    report: (lesson_type: LessonType, id: any) =>
      `api/support/report-issue/?lesson_type=${lesson_type}&id=${id}`,
    submitMcqAssignment: (id: any) =>
      `submit/mcq-assignment/create-submission/?mcq_assignment_id=${id}`,
    nextLesson: (batchName: any) => `api/next-lesson/?batch_name=${batchName}`,
    prevLesson: (batchName: any) => `api/prev-lesson/?batch_name=${batchName}`,
    logVideo: (batchName: any) =>
      `submit/log_video_as_watched/?batch_name=${batchName}`,
    getTextContent: (batchName: any, id: any) =>
      `api/text/?text_id=${id}&batch_name=${batchName}`,
  },
  assessment: {
    list: () => `api/assessment/assessment-links/`,
    list2: () => `api/assessment_V2/get-assessments/`,
    getallproblems: () => `api/assessment_V2/get-problems/`,
    getallsinglemcqs: () => `api/assessment_V2/get-single-mcq/`,
    getallmultimcqs: () => `api/assessment_V2/get-multi-mcq/`,
    getallsubjectiveques: () => `api/assessment_V2/get-subjective-questions/`,
    createAssessment: () => `api/assessment_V2/create-assessment/`,
    createSection: () => `api/assessment_V2/create-assessment-item/`,

    getallsets: (sections_type: string) =>
      `api/assessment_V2/get-sets/?set_type=${sections_type}`,

    assessmentDetail: (id: string) =>
      `api/assessment_V2/admin/assessment-detail/?test_id=${id}`,
    assessmentDetails: (id: string) =>
      `api/assessment_V2/details/?assessment_id=${id}`,
    assessmentInfo: (id: string) =>
      `api/assessment_V2/assessment-info/?assessment_id=${id}`,
    submitAssessment: (id: string) =>
      `api/assessment_V2/open-assessment-submission/?assessment_id=${id}`,
    submitAssignment: (batchName: any, id: any) =>
      `submit/assignment/create-submission/?assignment_id=${id}&batch_name=${batchName}`,
    report: (lessonType: LessonType, id: any) =>
      `api/support/report-issue/?lesson_type=${lessonType}&id=${id}`,
    discussions: (lessonType: LessonType, id: any) =>
      `api/discussions/?discussion_type=${lessonType}&discussion_type_id=${id}`,
    submitProblem: (id: string) =>
      `api/assessment_V2/submit-problem/?problem_id=${id}`,
    checkSubmitStatus: (token: string) =>
      `api/assessment_V2/get-submit-task-status/${token}`,
    checkStatus: (token: String) =>
      `submissions/${token}?base64_encoded=false&fields=stdout,stderr,status_id,language_id&wait=true`,
    getAssessmentSections: (id: string | undefined) =>
      `api/assessment_V2/get-assessment-items/?test_id=${id}`,
  },
  lessons: {
    weekList: (batchName: string) => `api/lessons/?batch_name=${batchName}`,
    lessonList: (weekNum: number, batchName: string) =>
      `api/lessons/${weekNum}/?batch_name=${batchName}`,
  },
  admin: {
    batchUsers: (batchName: string[]) =>
      `api/admin/batch-users/?batch=[${[...batchName]}]`,

    batchList: () => "api/admin/batch-lists",
    addUser: () => "api/admin/create-student-account/",
    deleteUser: (username: string) => `api/admin/student-account/${username}`,
    updateUser: (username: string, batches: string[]) =>
      `api/admin/student-account/${username}?batch=[${batches.map(
        (batch) => `"${batch}"`
      )}]`,
    changePassword: (username: string) =>
      `api/admin/change-password/?username=${username}`,
    addVideoContent: (batchName: string, week_number: number) =>
      `api/admin/create-video-lecture/?batch_name=${batchName}&week_number=${week_number}`,
    createBulkStudent: () => `api/admin/create-bulk-student-account/`,
    lesson: {
      update: (batchName: string, weekNumber: number) =>
        `api/admin/update-lessons-priority/?batch_name=${batchName}&week_number=${weekNumber}`,
      weekList: (batchName: string) =>
        `api/admin/batch-contents/?batch_name=${batchName}`,
      lessonList: (batchName: string, weekNumber: number) =>
        `api/admin/lesson-weekly/?batch_name=${batchName}&week_number=${weekNumber}`,
      remove: (batchName: string, weekNumber: number, lessonId: number) =>
        `api/admin/delete-lesson/?batch_name=${batchName}&week_number=${weekNumber}&lesson_id=${lessonId}`,
    },
    getBatchStats: () => `api/admin/batch-stats/`,
    getTimeSpentInfo: () => `api/admin/get-spent-time-info/`,
    getBatchStatsUser: () => `api/admin/user-stats/`,
    getTimeStatsUser: () => `api/admin/user-time-stats/`,
  },
  leaderboard: (batchName: string) =>
    `api/leaderboard/?batch_name=${batchName}`,
  activeDays: (batchName: string) => `api/active-days/?batch_name=${batchName}`,
  assessments: (id: any) => `api/assessment/details/?assessment_id=${id}`,
  liveclasses: (batchName: any) =>
    `api/liveclasses/upcoming-classes?batch_name=${batchName}`,

  interview: {
    preparation: () => `https://practiceforall.com/api/widget_authentication`,
  },
  vimeo: {
    items: (userId: any, projectId: any) =>
      `users/${userId}/projects/${projectId}/items?direction=asc&filter=folder&page=1&per_page=100&sort=default`,
    addSubFolder: (userId: any) => `users/${userId}/projects`,
    addVideoToFolder: (userId: any, projectId: any, videoId: any) =>
      `users/${userId}/projects/${projectId}/videos/${videoId}`,
    uploadVideo: (userId: any) => `users/${userId}/videos`,
  },
  sessions: {
    start: () => `accounts/user-session/start`,
    stop: () => `accounts/user-session/end`,
    killAll: () => `accounts/user-session/endprev`,
    keep_alive: () => `accounts/user-session/keep_alive`,
  },
  aiPrompt: {
    videoTitle: (batchName: any, week_no: any) =>
      `api/support/video-title/?batch_name=${batchName}&weekno=${week_no}`,
    description: () => `api/support/ai-video-description/`,
    mcq: () => `api/support/ai-video-mcq/`,
    allBatches: () => `api/support/allbatches/`,
  },
};
