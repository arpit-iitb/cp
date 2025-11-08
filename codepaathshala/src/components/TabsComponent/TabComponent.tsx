import { PROBLEMDATA } from "../../_utils/interface";
import { useTheme } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { TabContext, TabList } from "@mui/lab";
import './style.css';
import { DifficultyLevel, DifficultyLevelIcon, LessonType } from "../../_utils/enum";
import Discussion from "components/Discussion";
import BugReport from "components/BugReport";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import { Button, IconButton, Tabs, Tooltip } from "@mui/material";
import { useParams } from "react-router-dom";
import useCheckMobileScreen from "hooks/useCheckMobileScreen";
import { ToastContainer } from "react-toastify";
import Description from "assets/svg/descritpion.svg"
import DiscussionIcon from "assets/svg/chat-bubble-left-right.svg"
import Submission from "assets/svg/submissions.svg"
import Report from "assets/svg/report.svg"


export default function TabComponent({ problem }: { problem: PROBLEMDATA }) {
    const isGreaterThan2xl = window?.innerWidth > 1536;
    const theme = useTheme();
    const [value, setValue] = useState("0");
    const [submissionDetails, setSubmissionDetails] = useState<any>(null);
    const { batch } = useParams();

    useEffect(() => {
        document.title = problem.title
        Prism.highlightAll();
    }, []);
    const isMobile = useCheckMobileScreen();

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };

    const showSubmissionDetails = (judgment: any, submission_date: any, source_code: any, text_source: any, file: any) => {
        setSubmissionDetails({ judgment, submission_date, source_code, text_source, file }) as any;
    };

    const hideSubmissionDetails = () => {
        setSubmissionDetails(null);
    };
    const SubmissionDetails = ({ judgment, submission_date, source_code, text_source, file }: any) => {
        return (
            <div className="mx-3">
                <h3 className="font-bold">
                    <FontAwesomeIcon icon={faArrowLeft} className="cursor-pointer text-primary-500"
                        onClick={() => hideSubmissionDetails()} /> Submission Details
                </h3>
                <div className="mt-3 flex flex-col justify-start items-start space-y-2 ml-3">
                    <p className={`font-bold ${judgment === 'Passed' ? 'text-green-700 px-6 py-4' : judgment === 'Failed' ? 'text-red-500 px-6 py-4' : 'text-[#F97316] px-6 py-4'}`}>Status: <span className="font-bold">{judgment}</span></p>
                    <p>Submission Time: <span className="font-bold">{formatDate(submission_date)}</span></p>
                    {source_code !== undefined && <pre className="language-python">
                        <code className="language-javascript">
                            {source_code}
                        </code>
                    </pre>}
                    {text_source !== undefined &&
                        <p className="w-full">
                            <pre className="language-python">
                                <code className="language-javascript" style={{ background: "#000000", color: "#FFFFFF", padding: "4px" }} dangerouslySetInnerHTML={{ __html: text_source } as any}>
                                </code>
                            </pre>
                            {/* {file} */}
                            {file !== undefined && file !== "google.com" && <iframe src={file} className="!w-full !min-h-[50svh] mt-4" />}

                        </p>
                    }
                </div>
            </div>

        );
    };

    function formatDate(date: string) {
        const inputDate = new Date(date);
        const day = inputDate.getDate().toString().padStart(2, '0');
        const month = (inputDate.getMonth() + 1).toString().padStart(2, '0');
        const year = inputDate.getFullYear();
        return `${day}-${month}-${year}`;
    }

    const SubmissionTableRow = ({ submission, showSubmissionDetails }: any) => {
        const { judgment, submission_date, source_code, text_source, file } = submission;
        return (
            <tr className="cursor-pointer"
                onClick={() => showSubmissionDetails(judgment, submission_date, source_code, text_source, file)}>
                <td className="">
                    <p className={`flex justify-between gap-3 whitespace-nowrap ${judgment === 'Passed' ? 'text-green-700 px-6 py-4' : judgment === 'Failed' ? 'text-red-500 px-6 py-4' : 'text-[#F97316] px-6 py-4'}`}>
                        {judgment}
                        <span className="text-secondary-950 opacity-40">
                            Submitted on {formatDate(submission_date)}
                        </span>
                    </p>

                </td>
            </tr>
        );
    };

    const SubmissionTable = ({ prevSubmissions, showSubmissionDetails }: any) => {
        return (
            <table className="min-w-full divide-y divide-gray-200 overflow-x-scroll">
                <tbody className="bg-white divide-y divide-gray-200">
                    {prevSubmissions?.map((submission: any) => (
                        <SubmissionTableRow key={submission.id} submission={submission}
                            showSubmissionDetails={showSubmissionDetails} />
                    ))}
                </tbody>
            </table>
        );
    };

    const [contentHidden, setContentHidden] = useState<boolean>(isMobile);

    const renderTabPanel = (index: number, children: any) => (
        <div className={`${parseInt(value) === index ? 'block' : 'hidden'} h-98-custom py-1`}>
            {children}
        </div>
    );

    return <>
        <ToastContainer />

        <div className="relative overflow-hidden">
            <Box sx={{ width: "100%" }}>
                <TabContext value={value}>
                    <Box
                        sx={{
                            backgroundColor: "#EBF3FF",
                            borderRadius: "0.5rem",
                            padding: "0.35rem 0.35rem",
                            width: "100%"
                        }}
                    >
                        <Tabs
                            className="text-secondary-300"
                            value={value}
                            onChange={handleChange}
                            aria-label="lab API tabs example"
                            TabIndicatorProps={{ sx: { display: 'none' } }}
                            variant={isMobile ? "scrollable" : "fullWidth"}
                            scrollButtons="auto"
                            sx={{ width: '100%' }}
                        >
                            <Tab
                                icon={<img src={Description} alt="description" className={`${value === "0" ? 'text-white' : ''}`} />}
                                iconPosition="start"
                                label="Description"
                                value="0"
                                disableRipple={true}
                                sx={{
                                    textTransform: 'none',
                                    borderRadius: '0.5rem',
                                    color: '#5D77A6',
                                    '&.Mui-selected': {
                                        backgroundColor: '#3183FF',
                                        color: 'white !important'
                                    },
                                    // minWidth: '100px' // Set a minimum width for better scrolling
                                }}
                            />
                            <Tab
                                icon={<img src={DiscussionIcon} alt="description" className={`${value === "1" ? 'text-white' : ''}`} />}
                                iconPosition="start"
                                label="Discussions"
                                value="1"
                                disableRipple={true}
                                sx={{
                                    textTransform: 'none',
                                    borderRadius: '0.5rem',
                                    color: '#5D77A6',
                                    '&.Mui-selected': {
                                        backgroundColor: '#3183FF',
                                        color: 'white !important'
                                    },
                                    // minWidth: '100px' // Set a minimum width for better scrolling
                                }}
                            />
                            {[LessonType.PROBLEM, LessonType.ASSIGNMENT].includes(problem.lesson_type) ? (
                                <Tab
                                    icon={<img src={Submission} alt="description" className={`${value === "2" ? 'text-white' : ''}`} />}
                                    iconPosition="start"
                                    label="Submissions"
                                    value="2"
                                    disableRipple={true}
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: '0.5rem',
                                        color: '#5D77A6',
                                        '&.Mui-selected': {
                                            backgroundColor: '#3183FF',
                                            color: 'white'
                                        },
                                        // minWidth: '100px' // Set a minimum width for better scrolling
                                    }}
                                />
                            ) : (
                                [LessonType.FULLSTACK].includes(problem.lesson_type) && (
                                    <Tab
                                        icon={<img src={Submission} alt="description" className={`${value === "2" ? 'text-white' : ''}`} />}
                                        iconPosition="start"
                                        label="Live Preview"
                                        value="2"
                                        disableRipple={true}
                                        sx={{
                                            textTransform: 'none',
                                            borderRadius: '0.5rem',
                                            color: '#5D77A6',
                                            '&.Mui-selected': {
                                                backgroundColor: '#3183FF',
                                                color: 'white'
                                            },
                                            // minWidth: '100px' // Set a minimum width for better scrolling
                                        }}
                                    />
                                )
                            )}
                            <Tab
                                icon={<img src={Report} alt="description" className={`${value === "3" ? 'text-white' : ''}`} />}
                                iconPosition="start"
                                label="Report"
                                value="3"
                                disableRipple={true}
                                sx={{
                                    textTransform: 'none',
                                    borderRadius: '0.5rem',
                                    color: '#5D77A6',
                                    '&.Mui-selected': {
                                        backgroundColor: '#3183FF',
                                        color: 'white'
                                    },
                                    // minWidth: '100px'
                                }}
                            />
                        </Tabs>
                    </Box>

                    {isMobile ?
                        <div className="my-3">
                            <p className="flex">
                                <Tooltip title={DifficultyLevel[problem?.difficulty_level ?? 1]}>
                                    <img src={DifficultyLevelIcon[problem?.difficulty_level ?? 1]} alt={DifficultyLevel[problem?.difficulty_level ?? 1]} className="h-6 w-6" />
                                </Tooltip>

                                <span className="text-2xl text-secondary-800 font-bold mb-4 ms-3">{problem.title}</span>
                            </p>

                            <Button className="mt-3 !rounded-lg w-full !bg-primary-500 !text-white !normal-case"
                                onClick={() => setContentHidden(prevState => !prevState)}
                                variant="outlined"
                                disableElevation={true}>{contentHidden ? 'Show More' : 'Hide Details'}</Button>
                        </div> : null}

                    <div className={(isMobile && contentHidden) ? 'hidden' : ''}>
                        {renderTabPanel(0, (
                            <div className="mb-3 mx-3">
                                {!isMobile &&
                                    <p className="mt-3 flex mx-3">
                                        <Tooltip title={DifficultyLevel[problem?.difficulty_level ?? 1]}>
                                            <img src={DifficultyLevelIcon[problem?.difficulty_level ?? 1]} alt={DifficultyLevel[problem?.difficulty_level ?? 1]} className="h-6 w-6" />
                                        </Tooltip>
                                        <span className="text-2xl text-secondary-800 font-bold mb-4 ms-3 ">{problem.title}</span>
                                    </p>
                                }
                                <div dangerouslySetInnerHTML={{ __html: problem?.description ? problem?.description : " " }} className="description mb-4 mx-3 text-justify"></div>
                                {problem.img_urls && problem.img_urls.map((img, index) => (
                                    <img alt={problem.title} src={img} key={index} />
                                ))}
                                <div className="grid grid-cols-12 gap-5 mx-2 mt-4">
                                    {(problem?.input_format !== "NA" || !problem?.input_format) && ![LessonType.VIDEO, LessonType.ASSIGNMENT].includes(problem?.lesson_type) && (
                                        <div className="col-span-12 sm:col-span-6 bg-primary-50 border border-1 border-primary-200 rounded-xl p-2">
                                            <p className="text-xl font-bold text-secondary-800">
                                                Input Format
                                                <br />
                                                <span className="break-words text-base text-justify" dangerouslySetInnerHTML={{ __html: problem?.input_format ?? "" }} style={{ whiteSpace: 'pre-wrap' }}></span>
                                            </p>
                                        </div>
                                    )}
                                    {(problem.output_format !== "NA" || !problem?.output_format) && ![LessonType.VIDEO, LessonType.ASSIGNMENT].includes(problem?.lesson_type) && (
                                        <div className="col-span-12 sm:col-span-6 bg-primary-50 border border-1 border-primary-200 rounded-xl p-2">
                                            <p className="text-xl font-bold text-secondary-800">
                                                Output Format
                                                <br />
                                                <span className="break-words text-base text-justify" dangerouslySetInnerHTML={{ __html: problem?.output_format ?? "" }} style={{ whiteSpace: 'pre-wrap' }}></span>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {(problem.constraints !== "NA" || !problem?.constraints) && ![LessonType.VIDEO, LessonType.ASSIGNMENT].includes(problem?.lesson_type) && (
                                    <div className="mx-3 my-4">
                                        <p className="text-xl font-bold text-secondary-800">
                                            Constraints
                                        </p>
                                        <p className="break-words text-justify" style={{ whiteSpace: 'pre-wrap' }}>{problem?.constraints}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                        {renderTabPanel(1, (
                            <Discussion id={problem.id} lesson_type={problem.lesson_type} batch_name={problem?.batch_name} />
                        ))}
                        {renderTabPanel(2, (
                            ![LessonType.VIDEO].includes(problem?.lesson_type) && (
                                [LessonType.PROBLEM, LessonType.ASSIGNMENT].includes(problem.lesson_type) ? (
                                    <div className={`h-96 overflow-y-scroll mx-3 mt-3 ${isGreaterThan2xl ? 'h-full' : ''}`}>
                                        {submissionDetails ? (
                                            <SubmissionDetails {...submissionDetails} />
                                        ) : (
                                            <SubmissionTable prevSubmissions={problem?.previous_submissions} showSubmissionDetails={showSubmissionDetails} />
                                        )}
                                        {!problem?.previous_submissions?.length && <p>No submissions yet.</p>}
                                    </div>
                                ) : (
                                    <div className="mt-3 mx-3">
                                        <label className="mt-3 text-xl text-secondary-900 font-bold">Live Preview:</label>
                                        <iframe srcDoc={problem.srcDoc} title="output" sandbox="allow-scripts" width="100%" height="420px" className="border border-primary-200 rounded rounded-xl mt-3" />
                                    </div>
                                )
                            )
                        ))}
                        {renderTabPanel(3, (
                            <BugReport id={problem.id} title={problem.title} lesson_type={problem.lesson_type} />
                        ))}
                    </div>

                </TabContext>
            </Box>
        </div>
    </>
}