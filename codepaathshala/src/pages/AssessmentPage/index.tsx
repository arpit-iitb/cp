import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@mui/material";
import WebCamComponent from "components/WebCam";
import { useEffect, useState } from "react";
import "./assessment.css";
import { Bounce, ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { AxiosResponse } from "axios";
import axiosHttp from "_utils/axios.index";
import { ApiConstants } from "_utils/api-constants";
import { AssessmentInfo, OpenAssessmentData } from "_utils/interface";
export default function AssessmentPage({ name, email, mobile, graduation, usn, resume_link }: OpenAssessmentData) {
    let openData = {
        name: name,
        email: email,
        mobile: mobile,
        graduation: graduation,
        usn: usn,
        resume_link: resume_link
    }

    const [assessmentInfo, setAssessmentInfo] = useState<AssessmentInfo>()
    const { id } = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        axiosHttp.get(ApiConstants.assessment.assessmentInfo(id as string))
            .then((res: AxiosResponse) => {
                if (!res?.data.title) {
                    document.title = "Live Assessment|CodePaathshala"
                }
                else {
                    document.title = `${res?.data.title}`
                }
                setAssessmentInfo(res.data)
            })
            .catch((error) => {
                navigate('/')
                console.error('Error fetching assessment data:', error);
            });
    }, [id]);

    const [canStart, setCanStart] = useState<boolean>(assessmentInfo?.proctored ? false : true);

    return (
        <section className="min-h-[70svh] flex">
            <div className="flex-1 flex justify-center items-center p-4 rounded">
                {assessmentInfo?.proctored && (
                    <WebCamComponent width={350} height={300} showBorder={false} faceDetected={(value: boolean) => setCanStart(value)} />
                )}
            </div>

            <div className="flex-1 flex flex-col justify-start items-start p-4">
                <p className="mb-2 text-4xl text-secondary-500">Ready to Ace Your  Challenge?</p>
                <p className="mb-4 text-[#222] text-start">
                    <ul className="mb-2 mt-3 text-justify w-10/12">
                        <li className="mb-2 text-justify"><strong>Stay Focused: </strong>Ensure you are in a quiet, distraction-free environment.</li>
                        <li className="mb-2 text-justify"><strong>Technical Check: </strong>Make sure your internet connection is stable and all necessary applications are closed.</li>
                        <li className="mb-2 text-justify"><strong>Full Screen Mode: </strong>The assessment will start in full screen. Do not exit full screen as it will be counted as a violation.</li>
                        <li className="mb-2 text-justify"><strong>Honesty Matters: </strong>Complete the assessment independently and with integrity.</li>
                    </ul>
                </p>

                <p className="font-bold text-primary-500 text-sm mb-3">Good luck! Click "Begin Assessment" when you’re ready.</p>

                <Button
                    disabled={!canStart}
                    variant="contained"
                    color="primary"
                    className={`!normal-case mt-4 ${!canStart? '!bg-gray-200':'!bg-primary-500'} `}
                    onClick={() => {
                        if (Object.values(openData)?.length > 0) {
                            localStorage.setItem("formData", JSON.stringify(openData));
                            navigate(`/assessment/online-assessment/test-id/${id}/start`);
                        } else {
                            navigate(`/assessment/${id}/start`);
                        }
                    }}
                >
                    Begin Assessment
                </Button>
            </div>
        </section>
    );

}