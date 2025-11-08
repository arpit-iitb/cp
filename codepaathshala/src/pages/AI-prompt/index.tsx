import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { AxiosResponse } from 'axios';
import { ApiConstants } from '_utils/api-constants';
import axiosHttp from '_utils/axios.index';
import { Title } from '_utils/interface';
import { WeekOptions } from '_utils/constants';
import { Bounce, toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
const weekOptions = WeekOptions
function AiPrompt() {
    const [batch, setBatch] = useState<string>('');
    const [batchName, setBatchName] = useState<{ label: string, value: string }[]>()
    const [weekNumber, setWeekNumber] = useState<string>('');
    const [videoContent, setVideoContent] = useState<string>('');
    const [mcqContent, setMcqContent] = useState<string>('');
    const [contentType, setContentType] = useState<string>('videoDescription');
    const [forMcq, setForMcq] = useState<boolean>(false);
    const [showVideoContent, setShowVideoContent] = useState<boolean>(false);
    const [titles, setTitles] = useState<Title[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<Title | null>(null);

    const handleBatchChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setBatch(e.target.value);
        setShowVideoContent(false);
    };
    useEffect(() => {
        getDataBatch();
    }, [])

    function getDataBatch() {
        setBatchName([])
        axiosHttp.get(ApiConstants.aiPrompt.allBatches()).then((res: AxiosResponse) => {
            if (res.data as { id: number, name: string }[]) {
                let data: { label: string, value: string }[] = [];
                res.data.forEach((single: { id: number, name: string }) => {
                    data.push({ label: single.name, value: single.name });
                });
                setBatchName(data);
            }
        })
            .catch((err: Error) => {
                throw new Error(err.message)
            })
    }

    const handleWeekNumberChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setWeekNumber(e.target.value);
        setShowVideoContent(!!e.target.value);
    };

    const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedId = parseInt(e.target.value);
        const selectedTitle = titles.find((title) => title.id === selectedId);
        setSelectedVideo(selectedTitle || null);
    };
    
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!selectedVideo) {
            console.error('No video selected.');
            toast.error('No video selected!', {
                position: 'bottom-center',
                closeOnClick: true,
                theme: 'colored',
                pauseOnHover: true,
                transition: Bounce,
                containerId: 'contentGenerate',
            });
            return;
        }

        const content = forMcq ? mcqContent.trim() : videoContent.trim();

        if (!content) {
            toast.error('Content cannot be empty!', {
                position: 'bottom-center',
                closeOnClick: true,
                theme: 'colored',
                pauseOnHover: true,
                transition: Bounce,
                containerId: 'contentGenerate',
            });
            return;
        }

        const payload = {
            prompt: content,
            videos: [{ id: selectedVideo.id, title: selectedVideo.title }],
        };

        const postEndpoint = forMcq ? ApiConstants.aiPrompt.mcq() : ApiConstants.aiPrompt.description();

        axiosHttp
            .post(postEndpoint, payload)
            .then((response: AxiosResponse) => {
                if (forMcq) {
                    setMcqContent('');
                } else {
                    setVideoContent('');
                }
                setWeekNumber('');
                setBatch('');
                setTitles([]);
                setSelectedVideo(null);
                toast.success(`${forMcq ? 'MCQ' : 'Video'} Content generated successfully!`, {
                    position: 'bottom-center',
                    closeOnClick: true,
                    theme: 'colored',
                    pauseOnHover: true,
                    transition: Bounce,
                    containerId: 'contentGenerate',
                });
            })
            .catch((error) => {
                toast.error(`Error generating ${forMcq ? 'MCQ' : 'Video'} content: ${error.message}`, {
                    position: 'bottom-center',
                    closeOnClick: true,
                    theme: 'colored',
                    pauseOnHover: true,
                    transition: Bounce,
                    containerId: 'contentGenerate',
                });
            });
    };


    useEffect(() => {
        fetchVideoData();
    }, [batch, weekNumber]);

    const fetchVideoData = () => {
        if (batch && weekNumber) {
            axiosHttp.get(ApiConstants.aiPrompt.videoTitle(batch, weekNumber))
                .then((res: AxiosResponse<{ titles: Title[] }>) => {
                    setTitles(res.data.titles);
                })
                .catch((error) => {
                    console.error('Error fetching video titles:', error);
                });
        }

    };

    return (
        <div className="flex justify-center items-center max-h-[70svh] mb-9">
            <ToastContainer containerId={"contentGenerate"} />
            <div className="items-center w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 ">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <h5 className="text-xl font-medium text-secondary-500 flex justify-center items-center text-2xl">Generate Content for Video</h5>
                    <div>
                        <label htmlFor="batch" className="block mb-2 text-sm font-medium text-secondary-500">Select Batch</label>
                        <select
                            id="batch"
                            value={batch}
                            onChange={handleBatchChange}
                            className="bg-primary-50 border border-gray-300 text-secondary-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        >
                            <option value="">Choose a batch</option>
                            {batchName?.map((single) => (
                                <option key={single.value} value={single.value}>{single.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="week-number" className="block mb-2 text-sm font-medium text-secondary-500">Select Week Number</label>
                        <select
                            id="week-number"
                            value={weekNumber}
                            onChange={handleWeekNumberChange}
                            className="bg-primary-50 border border-gray-300 text-secondary-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        >
                            <option value="">Choose a week number</option>
                            {weekOptions.map((single) => (
                                <option key={single.value} value={single.value}>{single.label}</option>
                            ))}
                        </select>
                    </div>
                    {showVideoContent && titles?.length > 0 && (
                        <>
                            <div>
                                <label htmlFor="video-content" className="block mb-2 text-sm font-medium text-secondary-500">Select Video Content</label>
                                <select
                                    id="video-content"
                                    onChange={handleSelectChange}
                                    className="bg-primary-50 border border-gray-300 text-secondary-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                >
                                    <option value="">Select a video</option>
                                    {titles.map((title) => (
                                        <option key={title.id} value={title.id}>{title.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col">
                                <label className="block text-sm font-medium text-secondary-500">Content Type</label>
                                <div className="flex items-center">
                                    <input
                                        id="video-description"
                                        type="radio"
                                        name="content-type"
                                        value="videoDescription"
                                        checked={contentType === 'videoDescription'}
                                        onChange={(e) => {
                                            setContentType(e.target.value);
                                            setForMcq(false); // Ensure forMcq is set to false when videoDescription is selected
                                        }}
                                        className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                                    />
                                    <label htmlFor="video-description" className="ml-2 text-sm font-medium text-secondary-500">
                                        Video Description
                                    </label>

                                    <input
                                        id="mcq-questions"
                                        type="radio"
                                        name="content-type"
                                        value="mcqQuestions"
                                        checked={contentType === 'mcqQuestions'}
                                        onChange={(e) => {
                                            setContentType(e.target.value);
                                            setForMcq(true); // Ensure forMcq is set to true when mcqQuestions is selected
                                        }}
                                        className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                                    />
                                    <label htmlFor="mcq-questions" className="ml-2 text-sm font-medium text-secondary-500">
                                        Mcq Questions
                                    </label>
                                </div>
                            </div>

                            <div>
                                {forMcq ? (
                                    <>
                                        <label htmlFor="prompt" className="block mb-2 text-sm font-medium text-secondary-500">Text Prompt</label>
                                        <textarea
                                            id="prompt"
                                            value={mcqContent}
                                            onChange={(e) => setMcqContent(e.target.value)}
                                            className="bg-primary-50 border border-gray-300 text-secondary-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <label htmlFor="prompt" className="block mb-2 text-sm font-medium text-secondary-500">Text Prompt</label>
                                        <textarea
                                            id="prompt"
                                            value={videoContent}
                                            onChange={(e) => setVideoContent(e.target.value)}
                                            className="bg-primary-50 border border-gray-300 text-secondary-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                        />
                                    </>
                                )}
                            </div>
                            <button type="submit" className="w-full text-white bg-primary-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Generate</button>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}

export default AiPrompt;
