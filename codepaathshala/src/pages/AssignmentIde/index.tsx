import SEO from "components/SEO";
import { ChangeEvent, useEffect, useState } from "react";
import QuillEditor from "components/QuillEditor/Quill";
import { useParams } from "react-router-dom";
import axiosHttp from "_utils/axios.index";
import { ApiConstants } from "_utils/api-constants";
import { AxiosResponse } from "axios";
import TabComponent from "components/TabsComponent/TabComponent";
import { AssignmentIdeInterface } from "../../_utils/interface";
import { LessonType } from "../../_utils/enum";
import PrevNext from "components/prevNext/prevnext";
import { Bounce, ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
// import { useDropzone } from 'react-dropzone';
function AssignmentIde({ fullData, batchName, customIde, onCodeChange }: { fullData?: AssignmentIdeInterface, batchName?: any, customIde?: boolean, onCodeChange?: any }) {
    const { batch, id } = useParams();
    const [assignmentData, setAssignmentData] = useState<AssignmentIdeInterface>();
    const [editorValue, setEditorValue] = useState<string>('');
    const [testResults, setTestResults] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null);
    const [previousData, setPreviousData] = useState<any>([])
    const [errorMsg, setErrorMsg] = useState('');
    const [fileLink, setFileLink] = useState('');
    const [showResults, setShowResults] = useState(' ')
    const handleEditorChange = (value: any) => {
        setEditorValue(value);
    };

    useEffect(() => {
        getData();
        // eslint-disable-next-line
    }, [batch, id, fullData]);

    useEffect(() => {
        getData();
        // eslint-disable-next-line
    }, []);
    function getData() {
        if (batch && id) {

            axiosHttp.get(ApiConstants.problems.assignments(batch, id))
                .then((res: AxiosResponse) => {
                    document.title = `${res.data.id}. ${res?.data.title}`
                    setAssignmentData(res.data)
                })

            axiosHttp.get(ApiConstants.problems.prevAssignmentSubmission(id))
                .then((res: AxiosResponse) => {
                    setPreviousData(res.data);
                })
        }

        else if (customIde) {
            setAssignmentData(fullData)
        }
    }

    function submitAssignment() {
        setLoading(true)
        setTestResults(false)
        let dataObj = {
            editor_data: editorValue,
            link: fileLink
        }
        if (customIde) {
            onCodeChange(editorValue)
            setLoading(false)
            setShowResults('Your Response has been recorded.')
            setTestResults(true)
        }
        else {
            axiosHttp.post(ApiConstants.problems.submitAssignment(batch, id), dataObj)
                .then((res: AxiosResponse) => {
                    setEditorValue('')
                    setShowResults(res.data.message)
                    setTestResults(true)
                    setLoading(false)
                    setSelectedFile(null);
                })
        }

    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files: any = e?.target?.files;
        console.info(files[0]?.type)
        const allowedTypes = ['application/pdf', 'application/x-zip-compressed'];
        const maxSizeMB = 1;
        if (files) {
            if (!allowedTypes.includes(files[0]?.type)) {
                setErrorMsg('Only PDF and Zip files are allowed.');
                setSelectedFile(null);
                return;
            } else if (files[0]?.size > maxSizeMB * 1024 * 1024) {

                setErrorMsg(`File size exceeds ${maxSizeMB} MB.`);
                setSelectedFile(null);
                return;
            } else {
                setSelectedFile(files[0]);
                setErrorMsg('');
            }


        }
        const formData = new FormData();
        formData.append('file', files[0]);
        axiosHttp.post(ApiConstants.problems.assignmentsFileUpload(), formData)
            .then((res: AxiosResponse) => {
                if (res.data.file) {
                    toast.success("File uploaded Successfully!", {
                        position: "bottom-center",
                        closeOnClick: true,
                        pauseOnHover: true,
                        transition: Bounce,
                        containerId: "videoUpload",
                        theme: "colored"
                    });
                    setFileLink(res.data.file);

                }
            })
            .catch((error: any) => {
                toast.error("Failed to  uploaded File Please check once!", {
                    position: "bottom-center",
                    closeOnClick: true,
                    pauseOnHover: true,
                    transition: Bounce,
                    containerId: "videoUpload",
                    theme: "colored"
                });
                console.error('File upload error:', error);

            });
    };

    return (
        <>
            <SEO title="Program IDE | CodePaathshala" description={"CodePaathshala"} name={"CodePaathshala"} />
            {assignmentData ? <section className={`  ${!customIde ? "px-6 min-h-[70svh] mb-3" : ""}`}>
                {!customIde && <PrevNext batchName={batch} problem={assignmentData} type={LessonType.ASSIGNMENT} />}
                <div className="grid grid-cols-12 gap-3 px-3">
                    <div className="col-span-12 md:col-span-6 !rounded-xl  border border-1 !border-primary-100 p-2">
                        {customIde ? <>
                            <div className="col-span-4">
                                <span className="text-2xl font-bold mb-3"> {assignmentData?.title}</span>
                                <p
                                    className="mb-4 description break-words text-base w-1/2"
                                    style={{ whiteSpace: 'pre-wrap' }}
                                    dangerouslySetInnerHTML={{ __html: assignmentData?.description || "" }}
                                ></p>
                            </div>
                        </> : <>
                            <TabComponent problem={{
                                id: assignmentData.id,
                                title: assignmentData?.title,
                                description: assignmentData?.description as string,
                                difficulty_level: assignmentData?.difficulty_level as any,
                                batch_name: assignmentData?.batch_name as string,
                                lesson_type: LessonType.ASSIGNMENT,
                                week_number: assignmentData?.week_number,
                                previous_submissions: previousData
                            }} />
                        </>}

                    </div>
                    <div className="col-span-12 md:col-span-6 !rounded-xl  border border-1 !border-primary-100 p-2">
                        <div className="mb-12 pb-2 lg:pb-0">
                            <QuillEditor onChange={handleEditorChange} />

                        </div>
                        <br />
                        {!customIde ? <>

                            <div className="mt-12 lg:mt-0">
                                <div className="flex justify-between ">
                                    <p className="text-secondary-600 text-md ">Upload relevant Submissions if any
                                        <span className="text-gray-500 text-xs mt-1">
                                            <p >Please upload files smaller than 1 MB and if you are sending only file no need to click on submit.</p>
                                        </span>
                                    </p>
                                    <input className="block w-full text-sm text-gray-500 mb-3 mt-3 rounded-xl border border-primary-200 p-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary-400 file:text-white file:text-blue-700 hover:file:bg-secondary-300" onChange={handleChange} accept=".pdf,.zip" type="file"></input>
                                </div>
                            </div>
                            <hr className="!rounded-xl  border border-1 !border-primary-100" />
                        </> : null}
                        <div className="grid grid-cols-12">
                            {loading && (
                                <>
                                    <div
                                        className=' col-span-12 border border-gray-300 mt-8 rounded rounded-xs p-2 flex justify-center align-center text-red-800'>
                                        Please wait...
                                    </div>
                                </>
                            )}
                            {errorMsg && (<>
                                <div
                                    className=' col-span-12 border border-gray-300 mt-8 rounded rounded-xs p-2 flex justify-center align-center text-red-800'>
                                    {errorMsg}
                                </div>
                            </>)}
                            {testResults && (
                                <>
                                    <div
                                        className=' col-span-12 border border-gray-300 mt-8 rounded rounded-xs p-2 flex justify-center align-center text-green-800'>
                                        {showResults}</div>
                                </>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <button type="submit"
                                className="col-span-5 mt-9 mb-4 bg-primary-500 text-white font-bold py-2 px-4 rounded cursor-pointer disabled:cursor-not-allowed "
                                disabled={!(assignmentData?.can_solve ?? true)}
                                onClick={submitAssignment}>Submit
                            </button>
                        </div>
                    </div>

                </div>
                <ToastContainer containerId={"videoUpload"} />
            </section > : null
            }

        </>
    )

}

export default AssignmentIde;