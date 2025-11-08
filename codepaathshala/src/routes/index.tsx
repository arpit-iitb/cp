import { lazy, Suspense } from "react";
import { RouteObject } from "react-router-dom";
import Loading from "pages/Loading";
import PageNotFound from "pages/404";
import AuthorizedRoute from "routes/AuthorizedRoute";
import ManageAssessment from "pages/ManageAssessment/index";
import AssessmentDetails from "pages/ManageAssessment/AssessmentDetails";
import CreateAssessment from "pages/CreateAssessment";

const Loadable = (Component: any) => (props: JSX.IntrinsicAttributes) =>
  (
    <Suspense fallback={<Loading />}>
      <Component {...props} />
    </Suspense>
  );

const Home = Loadable(lazy(() => import("pages/Home")));
const RegisteredBatches = Loadable(
  lazy(() => import("pages/RegisteredBatches"))
);
const AssessmentLinks = Loadable(lazy(() => import("pages/AssessmentLink")));
const Login = Loadable(lazy(() => import("pages/Login")));
const Register = Loadable(lazy(() => import("pages/Register")));
const ProfilePage = Loadable(lazy(() => import("pages/Account/Profile")));
const ChangePassword = Loadable(
  lazy(() => import("pages/Account/ChangePassword"))
);
const EditProfilePage = Loadable(
  lazy(() => import("pages/Account/EditProfile"))
);
const BatchProblemPage = Loadable(
  lazy(() => import("pages/Problems/BatchProblem"))
);
const IdeLink = Loadable(lazy(() => import("pages/ProgramIde")));
const FullStackLink = Loadable(lazy(() => import("pages/Full-stack-Ide")));
const VideoIdeLink = Loadable(lazy(() => import("pages/video-Ide")));
const AssignmentIdeLink = Loadable(lazy(() => import("pages/AssignmentIde")));
const ResumeLink = Loadable(lazy(() => import("pages/Resume-Builder")));
const AiPromptLink = Loadable(lazy(() => import("pages/AI-prompt")));
const McqIdeLink = Loadable(lazy(() => import("pages/Mcq-Ide")));
const AssessmentPageLink = Loadable(lazy(() => import("pages/AssessmentPage")));
const SendOTPLink = Loadable(lazy(() => import("pages/SendOTP")));
const ResetPasswordLink = Loadable(lazy(() => import("pages/ResetPassword")));
const OpenAssessmentLink = Loadable(
  lazy(() => import("pages/AssessmentPage/OpenAssessment"))
);
const AdminBatchManageLink = Loadable(
  lazy(() => import("pages/AdminBatchManagement/index"))
);
const StudentManageLink = Loadable(
  lazy(() => import("pages/AdminBatchManagement/StudentBatch"))
);
const ContentManageLink = Loadable(
  lazy(() => import("pages/AdminBatchManagement/ContentBatch"))
);

const AssessmentStart = Loadable(
  lazy(() => import("pages/AssessmentPage/Assessment"))
);
const AssessmentResult = Loadable(
  lazy(() => import("pages/AssessmentPage/AssessmentResult"))
);

const InterViewPreparation = Loadable(
  lazy(() => import("pages/InterviewPractice"))
);
// const AdminDashboard = Loadable(lazy(() => import("pages/AdminDashboard")));
// const VideoUploader = Loadable(lazy(() => import("components/VideoUploader")));
const TextIde = Loadable(lazy(() => import("pages/Text-Ide")));
const routes: RouteObject[] = [
  {
    path: "/",
    index: true,
    element: <Home />,
  },
  {
    path: "dashboard",
    element: <AuthorizedRoute />,
    children: [
      {
        path: ":uid",
        element: <RegisteredBatches />,
      },
      {
        path: "",
        element: <RegisteredBatches />,
      },
    ],
  },
  {
    path: "mock-interview",
    element: <AuthorizedRoute />,
    children: [
      {
        path: "",
        element: <InterViewPreparation />,
      },
    ],
  },
  {
    path: "ai-video-content",
    element: <AuthorizedRoute />,
    children: [
      {
        path: "",
        element: <AiPromptLink />,
      },
    ],
  },
  // {
  //     path: "my-admin-dashboard",
  //     element: <AuthorizedRoute />,
  //     children: [
  //         {
  //             path: "",
  //             element: <AdminDashboard />
  //         }
  //     ]
  // },

  {
    path: "account",
    element: <AuthorizedRoute />,
    children: [
      {
        path: "edit-profile",
        element: <EditProfilePage />,
      },
      {
        path: "change-password",
        element: <ChangePassword />,
      },
      {
        path: "resume-builder",
        element: <ResumeLink />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: "assessment",
    element: <AuthorizedRoute />,
    children: [
      {
        path: "",
        element: <AssessmentLinks />,
      },
      {
        path: ":id",
        element: <AssessmentPageLink />,
      },
    ],
  },
  {
    path: "manage-assessment",
    element: <AuthorizedRoute />,
    children: [
      { path: "", element: <ManageAssessment /> },
      { path: ":id", element: <AssessmentDetails /> },
    ],
  },
  {
    path: "create-assessment",
    element: <AuthorizedRoute />,
    children: [{ path: ":id", element: <CreateAssessment /> }],
  },
  {
    path: "assessment/online-assessment/test-id/:id",
    element: <OpenAssessmentLink />,
  },
  {
    path: "assessment/online-assessment/test-id/:id",
    element: <OpenAssessmentLink />,
  },
  {
    path: "assessment/online-assessment/test-id/:id/start",
    element: <AssessmentStart />,
  },
  {
    path: "assessment/online-assessment/test-id/:id/result",
    element: <AssessmentResult />,
  },
  {
    path: "problems",
    element: <AuthorizedRoute />,
    children: [
      // {
      //     path: "",
      //     element: <AllProblems />
      // },
      {
        path: ":batch_name",
        element: <BatchProblemPage />,
      },
      {
        path: "problem/:batch/:id",
        element: <IdeLink />,
      },
      {
        path: "full-stack/:batch/:id",
        element: <FullStackLink />,
      },
      {
        path: "video/:batch/:id",
        element: <VideoIdeLink />,
      },
      {
        path: "text/:batch/:id",
        element: <TextIde />,
      },
      {
        path: "assignment/:batch/:id",
        element: <AssignmentIdeLink />,
      },
      {
        path: "mcq/:batch/:id",
        element: <McqIdeLink />,
      },
    ],
  },
  {
    path: "manage",
    element: <AuthorizedRoute />,
    children: [
      {
        path: "batch",
        element: <AdminBatchManageLink />,
      },
      {
        path: "students",
        element: <StudentManageLink />,
      },
      {
        path: "content",
        element: <ContentManageLink />,
      },
    ],
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "login/:uid",
    element: <Login />,
  },
  {
    path: "register",
    element: <Register />,
  },
  {
    path: "reset-password",
    element: <ResetPasswordLink />,
  },
  {
    path: "*",
    element: <PageNotFound />,
  },
  {
    path: "send-otp",
    element: <SendOTPLink />,
  },
];

export default routes;
