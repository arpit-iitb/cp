import React, { useEffect, useState } from "react";
import { DiscussionData, DiscussionRequest } from "../_utils/interface";
import { TextField } from "@mui/material";
import Divider from "@mui/material/Divider";
import axiosHttp from "../_utils/axios.index";
import { ApiConstants } from "../_utils/api-constants";
import { LessonType } from "../_utils/enum";
import DiscussionCard from "components/cards/DiscussionCard";

export default function Discussion({ id, lesson_type, batch_name }: { id: any, lesson_type: LessonType, batch_name: string }) {
    const [formData, setFormData] = useState<DiscussionRequest>({
        discussion_text: "",
        batch_name: batch_name
    })
    const [discussions, setDiscussions] = useState<DiscussionData[]>([]);
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        axiosHttp.post(ApiConstants.assessment.discussions(lesson_type, id), formData).then((res) => {
            setDiscussions([res.data, ...discussions]);
            setFormData(prevFormData => ({
                ...prevFormData,
                discussion_text: ""
            }));
        })

    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (formData)
            setFormData({ ...formData, [event.target.name]: event.target.value });
    }
    useEffect(() => {
        axiosHttp.get(ApiConstants.assessment.discussions(lesson_type, id)).then((res) => {

            sortByDate(res.data);
            setFormData({ discussion_text: "", batch_name: batch_name });
        })
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        return () => {
            setDiscussions([]);
            setFormData({ discussion_text: "", batch_name: batch_name });
        }
        // eslint-disable-next-line
    }, []);

    function sortByDate(data: DiscussionData[]) {
        data.sort((a, b) => {

            return (new Date(b.created_on)).getTime() - (new Date(a.created_on)).getTime();
        });
        setDiscussions(data);
    }
    return <>
        <form onSubmit={(e) => handleSubmit(e)}>
            <div className="mb-5 mt-5 mx-3">
                <p className="text-secondary-800 fw-bold text-2xl mb-3">Start a Discussion</p>
                <TextField
                    className="!border !border-1 !border-primary-100"
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
                    fullWidth
                    multiline
                    rows={5}
                    value={formData?.discussion_text}
                    onChange={handleChange}
                    label="Say something here...."
                    placeholder="Start typing..."
                    name="discussion_text"
                >
                </TextField>
            </div>
            <div className="mb-3 flex justify-end">
                <button disabled={formData?.discussion_text === '' || formData?.discussion_text === ' '}
                    className="px-6 py-3 bg-primary-500 rounded text-white hover:shadow-lg transition disabled:bg-primary-200">Post
                </button>
            </div>
        </form>
        <Divider className="!border !border-1 !border-primary-100" />
        <div className="grid grid-cols-1 gap-6 max-h-[40svh] overflow-y-auto mt-2 mx-3">
            {discussions.length > 0 && <span className="text-secondary-800 text-xl">Discussions ({discussions?.length})</span>
            }
            {discussions && discussions.length > 0 ? discussions.map((discussion, index) => (
                <>
                    <DiscussionCard key={index} {...discussion} />
                </>
            )) : <p className="text-center text-light text-sm">Have some thoughts, start discussion now...</p>}
        </div>

    </>
}