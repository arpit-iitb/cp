import SEO from "components/SEO";
import { useEffect, useRef, useState } from "react";
import VideoPlayer from "components/Video-palyer";
import axiosHttp from "../../_utils/axios.index";
import { ApiConstants } from "../../_utils/api-constants";
import { useParams } from "react-router-dom";
import { ProfileDataInterface, VideoData } from "../../_utils/interface";
import { AxiosResponse } from "axios";
import TabComponent from "components/TabsComponent/TabComponent";
import { LessonType } from "../../_utils/enum";
import PrevNext from "components/prevNext/prevnext";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import McqIde from "components/MCQ-ide/mcq-ide";
import ShowResponse from "components/MCQ-ide/ShowResponse";
import DocSvg from "../../assets/svg/Document.svg";
import OpenSvg from "../../assets/svg/viewNow.svg";
import CloseSvg from "../../assets/svg/close.svg"


function VideoIde() {
    const { id, batch } = useParams();
    const [videoData, setVideoData] = useState<VideoData>()
    const [firstTime, setFirstTime] = useState<boolean>(false)
    const [questions, setQuestions] = useState([])
    const [isResultSeen, setResultSeen] = useState<boolean>(false)


    const videoPlayerRef = useRef(null);
    const [profileData, setProfileData] = useState<ProfileDataInterface>()
    // const [expandedPanel, setExpandedPanel] = useState(null);
    const [expandedPanel, setExpandedPanel] = useState<string | false>(false); // Adjusted state type

    const handleAccordionChange = (panel: any) => (event: any, isExpanded: boolean) => {
        setExpandedPanel(isExpanded ? panel : false);
    };

    useEffect(() => {
        if (id && batch) {
            getData();
            axiosHttp.get(ApiConstants.accounts.profileDetails).then((res: AxiosResponse) => {
                setProfileData(res.data);
            })
        }
    }, []);

    useEffect(() => {
        getData();
        setExpandedPanel(false);
    }, [batch, id]);

    useEffect(() => {
        getMcqData();
        setResultSeen(false)
    }, [id]);

    function getMcqData() {
        if (id) {
            axiosHttp.get(ApiConstants.problems.mcqQuestions(id)).then((res: AxiosResponse) => {
                if (!res?.data.title) {
                    document.title = "Practice MCQ Assessment|Coding Judge"
                }
                else {
                    document.title = `${res?.data.title}`

                }

                //localStorage.setItem(`mcqData_${id}`, JSON.stringify(res.data));
                setQuestions(res.data?.questions)
            }).catch((error) => {
                console.error('Error fetching data:', error);
            });
        }
    }


    function getData() {
        if (id && batch) {
            axiosHttp.get(ApiConstants.problems.video(batch, id)).then((res: AxiosResponse) => {
                setVideoData(res.data);
            })

            axiosHttp.post(ApiConstants.problems.getVideoWatched(id)).then((res: any) => {
                if (res?.data?.watched === true) {
                    setFirstTime(false)
                }
                else {
                    setFirstTime(true)
                }
            });
        }
    }

    return (<>
        <SEO title={videoData?.title ?? "Coding Judge"} description={videoData?.description ?? "Coding Judge"} name={"Coding Judge"} />
        {(videoData && profileData) ? <>
            <section className="px-6 min-h-[70svh]">
                <PrevNext batchName={batch} problem={videoData} type={LessonType.VIDEO} />
                <div className="grid grid-cols-12 gap-3 px-3">
                    <div className="col-span-12 lg:col-span-4 rounded-xl border border-primary-100 p-2">
                        <TabComponent
                            problem={{
                                title: videoData?.title,
                                description: videoData?.description,
                                id: videoData?.id,
                                difficulty_level: videoData?.difficulty_level,
                                batch_name: videoData?.batch_name,
                                lesson_type: LessonType.VIDEO,
                                link: videoData?.link,
                                pptLink: videoData?.pptLink,
                                docsLink: videoData?.docsLink,
                                img_urls: videoData?.img_urls,
                                week_number: videoData?.week_number,
                            }}
                        />

                    </div>
                    <div className="col-span-12 lg:col-span-8 ml-1">
                        <div ref={videoPlayerRef} className="w-full h-full rounded-xl border border-primary-100">
                            {videoData ?
                                <VideoPlayer firstTime={firstTime} link={videoData?.link} batchName={batch} duration={videoData?.duration}
                                    id={id} /> : <p>Loading...</p>}

                        </div>
                    </div>

                </div>
                <div className="overflow-y-auto">
                    <div className="grid grid-cols-12 gap-3 mt-3 mb-5">
                        <div className="col-span-4 invisible">  ss</div>
                        <div className="col-span-12 lg:col-span-8 flex flex-col justify-end ml-2 mr-2">
                            {(videoData?.pptLink) &&
                            <Accordion className="px-[8px]"
                                expanded={expandedPanel === 'panel1'}
                                onChange={handleAccordionChange('panel1')}
                                sx={{
                                    border: '1px solid #AFD0FF',
                                    borderRadius: '8px',
                                    marginBottom: '10px',
                                    '&:before': {
                                          display: 'none'
                                        },
                                    '&:first-of-type': {
                                        borderTopLeftRadius: '8px',
                                        borderTopRightRadius: '8px',
                                    },
                                    '&:last-of-type': {
                                        borderBottomLeftRadius: '8px',
                                        borderBottomRightRadius: '8px',
                                    },
                                    '& .MuiAccordionSummary-root': {
                                    },
                                    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                                        transform: 'rotate(0deg)',
                                    },
                                    '& .MuiAccordionDetails-root': {
                                        padding: '16px',
                                        backgroundColor: '#ffffff',
                                    },
                                    '& .MuiAccordionSummary-root .MuiTypography-root': {
                                        color: '#001F68',
                                    },
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={expandedPanel === 'panel1' ? <img
                                        className="w-16 relative overflow-hidden shrink-0"
                                        alt=""
                                        src={CloseSvg}
                                    /> : <img
                                        className="w-20 relative overflow-hidden shrink-0"
                                        alt=""
                                        src={OpenSvg}
                                    />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                >
                                    <img
                                        className="h-6 w-6  relative overflow-hidden shrink-0"
                                        loading="lazy"
                                        alt=""
                                        src={DocSvg}
                                    />
                                    <Typography className="pl-2">PPT Document</Typography>
                                </AccordionSummary>
                                <AccordionDetails
                                    sx={{                                        
                                        flexDirection: 'column', // Stack content vertically in mobile view
                                    }}
                                >
                                    {videoData?.pptLink ? (
                                        <div className="mb-2 w-full h-full overflow-hidden">
                                            <iframe
                                                title={videoData.title}
                                                src={videoData?.pptLink}
                                                allowFullScreen
                                                className="w-full min-h-[50vh]" // Adjust height as needed
                                            ></iframe>
                                        </div>
                                    ) : (
                                        <p>No PPT Document available</p>
                                    )}
                                </AccordionDetails>
                            </Accordion>
                            }
                            {(videoData?.docsLink) &&
                            <Accordion className="px-[8px]"
                                expanded={expandedPanel === 'panel2'}
                                onChange={handleAccordionChange('panel2')}
                                sx={{
                                    border: '1px solid #AFD0FF',
                                    borderRadius: '8px',
                                    marginBorder: '10px',
                                    '&:before': {
                                          display: 'none'
                                        },
                                    '&:first-of-type': {
                                        borderTopLeftRadius: '8px',
                                        borderTopRightRadius: '8px',
                                    },
                                    '&:last-of-type': {
                                        borderBottomLeftRadius: '8px',
                                        borderBottomRightRadius: '8px',
                                    },
                                    '& .MuiAccordionSummary-root': {
                                    },
                                    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                                        transform: 'rotate(0deg)',
                                    },
                                    '& .MuiAccordionDetails-root': {
                                        padding: '16px',
                                        backgroundColor: '#ffffff',
                                    },
                                    '& .MuiAccordionSummary-root .MuiTypography-root': {
                                        color: '#001F68',
                                    },
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={expandedPanel === 'panel2' ? <img
                                        className="w-16 relative overflow-hidden shrink-0"
                                        alt=""
                                        src={CloseSvg}
                                    /> : <img
                                        className="w-20 relative overflow-hidden shrink-0"
                                        alt=""
                                        src={OpenSvg}
                                    />}
                                    aria-controls="panel2a-content"
                                    id="panel2a-header"
                                >
                                    <img
                                        className="h-6 w-6 relative overflow-hidden shrink-0"
                                        loading="lazy"
                                        alt=""
                                        src={DocSvg}
                                    />
                                    <Typography className="pl-2">Document</Typography>
                                </AccordionSummary>
                                <AccordionDetails
                                    sx={{
                                        flexDirection: 'column', // Stack content vertically in mobile view
                                    }}
                                >
                                    {videoData?.docsLink ? (
                                        <div className="mt-6 w-full h-full overflow-hidden">
                                            <iframe
                                                title={videoData.title}
                                                src={videoData?.docsLink}
                                                allowFullScreen
                                                className="w-full min-h-[50vh]" // Adjust height as needed
                                            ></iframe>
                                        </div>
                                    ) : (
                                        <p>No Document available</p>
                                    )}
                                </AccordionDetails>
                            </Accordion>
                            }
                            {(questions) &&
                            <Accordion className="px-[8px]"
                                expanded={expandedPanel === 'panel3'}
                                onChange={handleAccordionChange('panel3')}
                                sx={{
                                    border: '1px solid #AFD0FF',
                                    borderRadius: '8px',
                                    marginTop: '10px',
                                    marginBottom: '10px',
                                    '&:before': {
                                          display: 'none'
                                        },
                                    '&:first-of-type': {
                                        borderTopLeftRadius: '8px',
                                        borderTopRightRadius: '8px',
                                    },
                                    '&:last-of-type': {
                                        borderBottomLeftRadius: '8px',
                                        borderBottomRightRadius: '8px',
                                    },
                                    '& .MuiAccordionSummary-root': {
                                    },
                                    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                                        transform: 'rotate(0deg)',
                                    },
                                    '& .MuiAccordionDetails-root': {
                                        padding: '16px',
                                        backgroundColor: '#ffffff',
                                    },
                                    '& .MuiAccordionSummary-root .MuiTypography-root': {
                                        color: '#001F68',
                                    },
                                }}

                            >
                                {/* Accordion summary for MCQ */}
                                <AccordionSummary
                                    expandIcon={expandedPanel === 'panel3' ? <img
                                        className="w-16 relative overflow-hidden shrink-0"
                                        alt=""
                                        src={CloseSvg}
                                    /> : <img
                                        className="w-20 relative overflow-hidden shrink-0"
                                        alt=""
                                        src={OpenSvg}
                                    />}
                                    aria-controls="panel3a-content"
                                    id="panel3a-header"
                                >
                                    <img
                                        className="h-6 w-6 relative overflow-hidden shrink-0"
                                        loading="lazy"
                                        alt=""
                                        src={DocSvg}
                                    />
                                    <Typography className="pl-2">Test Your Understanding</Typography>
                                </AccordionSummary>

                                {/* Accordion details for MCQ */}
                                <AccordionDetails
                                    sx={{
                                        flexDirection: 'column', // Stack content vertically in mobile view
                                    }}
                                >
                                    {
                                        questions ? (
                                            isResultSeen ? (
                                                id ? (
                                                    <ShowResponse id={id} questions={questions} />
                                                ) : (
                                                    <div><h4>ID is not available.</h4></div>
                                                )
                                            ) :
                                                (
                                                    <McqIde
                                                        quizData={questions}
                                                        id={id}
                                                        canSolve={true}
                                                        forTestYourUnderstanding={true}
                                                        setResultSeen={setResultSeen}
                                                    />
                                                )
                                        ) : (
                                            <div><h4>Will be available soon.</h4></div>
                                        )
                                    }
                                </AccordionDetails>
                            </Accordion>
                            }
                        </div>

                    </div>
                </div>

            </section>
        </> : null}

    </>
    )

}

export default VideoIde;