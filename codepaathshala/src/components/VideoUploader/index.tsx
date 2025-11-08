import { ApiConstants } from "_utils/api-constants";
import { FolderItem, UploadVideo } from "_utils/interface";
import React, { ChangeEvent, useEffect, useState } from "react";
import { Button, Modal, Box, TextField, Select, MenuItem } from "@mui/material";
import { Bounce, toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import axios, { AxiosResponse } from "axios";
import axiosHttp from "_utils/axios.index";
import ProgressBar from "components/ProgressBar";
const baseUrl = "https://api.vimeo.com";
const token = "b6ac57a74724cd5d545866aa9ae720b3";
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #ffffff',
    boxShadow: 24,
    p: 4,
};

function VideoUploader({ batchName, weekNumber, clientId, projectId, handleResponse }: { batchName: string, weekNumber: number, clientId: number, projectId: number, handleResponse: (data: any) => void }) {

    const [state, setState] = useState<UploadVideo>({
        selectedFolder: null,
        upload: false,
        selectedSubFolder: null,
        folderItems: [],
        folderHistory: [],
        modalOpen: false,
        rootCall: false,
        newFolderName: "",
        uploadLink: "",
        file: null,
        isAddingFolder: true,
        uploadProgress: 0
    });
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        link: '',
        pptLink: '',
        docsLink: '',
        difficulty_level: '',
    });
    const [uploading, setIsUploading] = useState(false)


    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    };

    const handleDifficultyChange = (event: any) => {
        setFormData({ ...formData, difficulty_level: event.target.value });
    };
    useEffect(() => {
        CommonCaller(clientId, String(projectId), true)

        // eslint-disable-next-line
    }, []);

    const handleFolderSelect = (itemUrl: string) => {
        if (state.selectedFolder) {
            setState((prevState: any) => ({
                ...prevState,
                folderHistory: [...prevState.folderHistory, prevState.selectedFolder],
                selectedFolder: itemUrl,
            }));
        }
        CommonCaller(clientId, itemUrl);
    }

    const handleBack = () => {
        const previousFolder = state.folderHistory.pop();
        if (previousFolder) {
            setState((prevState: any) => ({
                ...prevState,
                selectedFolder: previousFolder,
                folderHistory: [...prevState.folderHistory],
            }));
            CommonCaller(clientId, previousFolder);
        }
    };

    const handleOpenModal = (isFolder: boolean) => {
        setState(prevState => ({
            ...prevState,
            isAddingFolder: isFolder,
            modalOpen: true,
        }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e?.target?.files;
        if (files && files.length > 0) {
            setState((prevState: any) => ({
                ...prevState,
                file: files[0],
            }));
        }
    };

    const handleCloseModal = () => setState((prevState: any) => ({
        ...prevState,
        modalOpen: false,
    }));

    const handleAddSubfolder = () => {
        setState(prevState => ({ ...prevState, folderItems: [] }));

        axios.post(`${baseUrl}/${ApiConstants.vimeo.addSubFolder(clientId)}`, {
            name: state.newFolderName,
            parent_folder_uri: `/users/${clientId}/projects/${state.selectedSubFolder || state.selectedFolder}`,
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        })
            .then(response => {
                const data = response.data;
                const newSubfolder = {
                    label: data.name,
                    value: data.uri.split('/').pop(),
                    totalItems: 0,
                    videos: false,
                };

                setState((prevState: any) => ({
                    ...prevState,
                    folderItems: [...prevState.folderItems, newSubfolder],
                    newFolderName: "",
                    rootCall: false,
                    folderHistory: [...prevState.folderHistory, state.selectedSubFolder || state.selectedFolder],
                }));
                handleCloseModal();
            })
            .catch(error => console.error('Error creating subfolder:', error));
    };



    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        axiosHttp.post(ApiConstants.admin.addVideoContent(batchName, weekNumber), formData).then((res: AxiosResponse) => {
            handleResponse(res.data);
            handleCloseModal();
            // window.location.reload();
            setState((prevState: any) => ({
                ...prevState,
                modalOpen: false,
            }));
            toast.success("Content Added Successfully!", {
                position: "bottom-center",
                closeOnClick: true,
                pauseOnHover: true,
                transition: Bounce,
                containerId: "videoUpload"
            });
        }).catch(error => {
            console.error('Error adding video content:', error);
        });
    }

    const handleAddVideo = () => {
        axios.post(`${baseUrl}/${ApiConstants.vimeo.uploadVideo(clientId)}`, {
            upload: { approach: "post" }
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        })
            .then(response => {
                const data = response.data;
                setState(prevState => ({
                    ...prevState,
                    uploadLink: data.upload.upload_link,
                    upload: true,
                }));
                const newSubfolder = {
                    uploadLink: data.upload.upload_link,
                    videoId: data.uri.split('/').pop(),
                    embedUrl: data.player_embed_url,
                };

                setFormData(prevState => ({
                    ...prevState,
                    link: data.player_embed_url
                }));

                return axios.put(`${baseUrl}/${ApiConstants.vimeo.addVideoToFolder(clientId, state.selectedSubFolder || state.selectedFolder, newSubfolder.videoId)}`, {}, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });
            })
            .then(response => {
                // Handle success response for adding video to folder if needed
                console.log('Video added to folder successfully:', response.data);
            })
            .catch(error => console.error('Error uploading video:', error));
    };

    const CommonCaller = (clientId: number, folderId: string, firstCall?: boolean) => {
        setState(prevState => ({ ...prevState, folderItems: [] }));

        axios.get(`${baseUrl}/${ApiConstants.vimeo.items(clientId, folderId)}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                const data = response.data;
                const result = data?.data?.map((single: any) => ({
                    label: single.folder.name,
                    value: single.folder.uri.split('/').pop(),
                    totalItems: single.folder.metadata.connections.folders.total || single.folder.metadata.connections.videos.total,
                    videos: single.folder.metadata.connections.folders.total <= 0,
                }));

                setState(prevState => ({
                    ...prevState,
                    folderItems: result,
                    selectedFolder: firstCall ? folderId : prevState.selectedFolder,
                    folderHistory: firstCall ? [folderId] : prevState.folderHistory,
                    selectedSubFolder: firstCall ? '' : prevState.selectedSubFolder,
                    rootCall: projectId === Number(folderId),
                }));
            })
            .catch(error => console.error('Error fetching folder items:', error));
    };
    const uploadFileToVimeo = () => {
        setIsUploading(true);
        if (!state.file || !state.uploadLink) return;

        const formData = new FormData();
        formData.append("file_data", state.file);

        axios.post(state.uploadLink, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (progressEvent?.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent?.total);
                    setState(prevState => ({
                        ...prevState,
                        uploadProgress: percentCompleted,
                    }));
                }
            }
        })
            .then((response) => {
                handleCloseModal();
                setIsUploading(false);
                setState(prevState => ({
                    ...prevState,
                    file: null,
                    uploadLink: "",
                    uploadProgress: 0,
                }));
                toast.success("Video uploaded Successfully!", {
                    position: "top-center",
                    closeOnClick: true,
                    pauseOnHover: true,
                    transition: Bounce,
                    theme: 'colored',
                    containerId: "videoUpload1"
                });
            })
            .catch((err) => {
                console.error(err);
                handleCloseModal();
                setIsUploading(false);
                setState(prevState => ({
                    ...prevState,
                    file: null,
                    uploadLink: "",
                    uploadProgress: 0,
                }));
            });
    };


    return (
        <>
            <div className="grid grid-cols-12">
                <div className="container col-span-6">
                    <h2 className="text-xl font-semibold mb-4">Folders</h2>

                    {state.folderItems.length > 0 && (
                        <>
                            <div className="h-[50svh] overflow-y-scroll">
                                <ul className="list-none">
                                    {state.folderHistory.length > 0 && !state.rootCall && (
                                        <Button onClick={handleBack}>Back</Button>
                                    )}
                                    {state.rootCall && (
                                        <li>
                                            <Button onClick={() => handleOpenModal(true)}>Add folder</Button>
                                        </li>
                                    )}
                                    {state.folderItems.map((item: FolderItem) => (
                                        <li
                                            key={item.value}
                                            className="cursor-pointer p-2 hover:bg-gray-200 rounded p-4 bg-gray-100 rounded-lg shadow-md mb-3 flex justify-between"
                                        >
                                            <span onClick={() =>
                                                (item.totalItems > 0 && !item.videos) ? handleFolderSelect(item.value) : null
                                            }
                                                className={` ${(item.totalItems > 0 && !item.videos) ? 'underline' : ''}`}
                                            >
                                                {item.label} ({item.totalItems}) {item.videos && (<span>Videos and No folder</span>)}
                                            </span>
                                            <div className="flex justify-end align-end">
                                                <Button onClick={() => {
                                                    handleOpenModal(false);
                                                    setState(prevState => ({ ...prevState, selectedSubFolder: item.value }));
                                                }}>Add Video</Button>
                                                <Button onClick={() => {
                                                    handleOpenModal(true);
                                                    setState(prevState => ({ ...prevState, selectedSubFolder: item.value }));
                                                }} className="flex justify-end align-end">Add Subfolder</Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-4 col-span-6">
                    <h2 className="text-xl font-semibold mb-4">Save Content</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-6 gap-4 me-3">
                        <div className="col-span-6 sm:col-span-3">
                            <TextField
                                label="Title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                fullWidth
                                size="small"
                            />
                        </div>
                        <div className="col-span-6 sm:col-span-3">
                            <TextField
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                fullWidth
                                size="small"
                                rows={4}
                            />
                        </div>
                        <div className="col-span-6 sm:col-span-3">
                            <TextField
                                label="Link"
                                name="link"
                                value={formData.link}
                                onChange={handleInputChange}
                                fullWidth
                                disabled
                                size="small"
                            />
                        </div>
                        <div className="col-span-6 sm:col-span-3">
                            <TextField
                                label="PPT Link"
                                name="pptLink"
                                value={formData.pptLink}
                                onChange={handleInputChange}
                                fullWidth
                                size="small"
                            />
                        </div>
                        <div className="col-span-6 sm:col-span-3">
                            <TextField
                                label="Docs Link"
                                name="docsLink"
                                value={formData.docsLink}
                                onChange={handleInputChange}
                                fullWidth
                                size="small"
                            />
                        </div>
                        <div className="col-span-6 sm:col-span-3">
                            <Select
                                label="Difficulty Level"
                                id="demo-simple-select-standard"
                                name="difficulty_level"
                                value={formData.difficulty_level}
                                onChange={handleDifficultyChange}
                                fullWidth
                                placeholder="Select an option"
                                size="small"
                            >
                                <MenuItem value={1}>Easy</MenuItem>
                                <MenuItem value={2}>Medium</MenuItem>
                                <MenuItem value={3}>Hard</MenuItem>
                            </Select>


                        </div>
                        <div className="col-span-6">
                            <Button type="submit" variant="contained" color="primary" fullWidth>
                                Submit
                            </Button>
                        </div>
                    </form>

                </div>

            </div>
            <Modal
                open={state.modalOpen}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                slotProps={{
                    backdrop: {
                        sx: {
                            position: 'fixed',
                        },
                    }
                }}
            >
                <Box sx={style}>
                    <h2>{state.isAddingFolder ? "Add Subfolder" : "Add Video"}</h2>
                    {state.isAddingFolder ? (
                        <TextField
                            label="Folder Name"
                            value={state.newFolderName}
                            onChange={(e) => setState(prevState => ({ ...prevState, newFolderName: e.target.value }))}
                            fullWidth
                        />
                    ) : (
                        <>
                            {state.upload ? (
                                <>
                                    <input
                                        type="file"
                                        accept="*"
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    {state.file && (
                                        <Button onClick={uploadFileToVimeo} variant="contained" color="primary" className="mt-2 w-full">
                                            Upload
                                        </Button>
                                    )}
                                    {uploading && (
                                        <div className="mt-2 w-full">
                                            <ProgressBar
                                                count={state.uploadProgress}
                                                showCount={true} />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p>Click on start button to upload</p>
                            )}
                        </>
                    )}
                    <div className="mt-2">
                        {!state.file && (
                            state.isAddingFolder ? (
                                <Button onClick={handleAddSubfolder} variant="contained" color="primary" className="w-full">
                                    Add
                                </Button>
                            ) : (
                                <Button onClick={handleAddVideo} variant="contained" color="primary" className="w-full">
                                    Start
                                </Button>
                            )
                        )}
                    </div>

                </Box>
            </Modal>

            <ToastContainer containerId={"videoUpload"} />
            <ToastContainer containerId={"videoUpload1"} />
        </>
    );
}

export default VideoUploader;
