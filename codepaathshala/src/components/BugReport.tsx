import React, { useEffect, useState } from "react";
import { ProfileDataInterface, ReportBugRequest } from "../_utils/interface";
import { TextField, makeStyles } from "@mui/material";
import { LessonType } from "../_utils/enum";
import { useAuth } from "hooks/AuthProvider";
import axiosHttp from "../_utils/axios.index";
import { ApiConstants } from "../_utils/api-constants";
import BugReportIcon from '@mui/icons-material/BugReport';
export default function BugReport({ id, title, lesson_type }: { id: string, title: string, lesson_type: LessonType }) {
    const [profile, setProfileData] = useState<ProfileDataInterface>();
    const [issueReported, setIssueReported] = useState(false);
    const [formData, setFormData] = useState<ReportBugRequest>({
        issue_description: ""
    })

    useEffect(() => {
        let userData = authContext.getUserInfo();
        if (userData)
            setProfileData(userData);
        // eslint-disable-next-line
    }, []);

    const authContext = useAuth();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    }
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        axiosHttp.post(ApiConstants.problems.report(lesson_type, id), formData).then(() => {
            setIssueReported(true);
        })
        // await authContext.loginAction(formData);
    }

    return <div className="text-[#222] mt-4 mx-3">
        {issueReported ? <div className="h-full w-full flex flex-col items-center justify-center">
            <p className="text-xl font-bold"><BugReportIcon fontSize={'large'} /> Issue has been reported!</p>
            <p className="font-light">We'll get back to you soon!</p>
        </div> : <>
            <p className="mb-6 text-gray-500 ">You are reporting an issue for
                <br />
                <span className="text-2xl text-secondary-900 font-bold opacity-100">{title}</span></p>
            <form onSubmit={(e) => handleSubmit(e)}>
                <div className="mb-5">
                    <TextField
                        value={formData.issue_description}
                        onChange={handleChange}
                        name="issue_description"
                        multiline
                        className="w-full"
                        size="small"
                        rows={3}
                        sx={
                            {
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    '& fieldset': {
                                        borderColor: '#AFD0FF',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#AFD0FF',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#AFD0FF',
                                    },
                                },
                                '& .MuiInputBase-input': {
                                    color: '#3183FF',
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#AFD0FF',
                                },
                                '& .MuiFormHelperText-root': {
                                    color: '#AFD0FF',
                                },
                            }}
                        label="Issue Description"
                        placeholder="Type issue here"
                        type="text"
                    />
                </div>
                {lesson_type === LessonType.PROBLEM ? (
                    <div className="mb-5">
                        <TextField
                            value={formData.your_code}
                            onChange={handleChange}
                            name="your_code"
                            multiline
                            className="w-full"
                            size="small"
                            rows={3}
                            sx={
                                {
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': {
                                            borderColor: '#AFD0FF',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#AFD0FF',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#AFD0FF',
                                        },
                                    },
                                    '& .MuiInputBase-input': {
                                        color: '#3183FF',
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: '#AFD0FF',
                                    },
                                    '& .MuiFormHelperText-root': {
                                        color: '#AFD0FF',
                                    },
                                }}
                            label="Your Code (Recommended)"
                            placeholder="Enter code here"
                            type="text"
                        />
                    </div>
                ) : null}
                <div className="mb-5">
                    <TextField
                        value={formData.contact_number}
                        onChange={handleChange}
                        name="contact_number"
                        className="w-full"
                        size="small"
                        sx={
                            {
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    '& fieldset': {
                                        borderColor: '#AFD0FF',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#AFD0FF',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#AFD0FF',
                                    },
                                },
                                '& .MuiInputBase-input': {
                                    color: '#3183FF',
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#AFD0FF',
                                },
                                '& .MuiFormHelperText-root': {
                                    color: '#AFD0FF',
                                },
                            }}
                        label="Contact number (Recommended)"
                        placeholder="Enter contact here"
                        type="text"
                    />
                </div>
                <div className="mb-3 flex justify-end">
                    <button
                        disabled={formData.issue_description === '' || formData.contact_number === ''}
                        className="px-6 py-3 bg-primary-500 rounded text-white hover:shadow-lg transition disabled:bg-primary-200"
                    >
                        Report
                    </button>
                </div>
            </form>
        </>}

    </div>
}