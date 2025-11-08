import MultiSelect from "components/MultiSelect";
import React, { useEffect, useState } from "react";
import Divider from "@mui/material/Divider";
import ProblemList from "pages/Problems/ProblemList";
import CJDialog from "components/CJDialog";
import axiosHttp from "../../_utils/axios.index";
import { ApiConstants } from "../../_utils/api-constants";
import { AxiosResponse } from "axios";
import VideoUploader from "components/VideoUploader";
import { Lesson, ProfileDataInterface } from "../../_utils/interface";
import { useAuth } from "hooks/AuthProvider";

export default function ContentBatch() {
    const authContext = useAuth();
    const [profile, setProfileData] = useState<ProfileDataInterface>();
    const [batch, setBatch] = useState<{ label: string, value: string }[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<string>();
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [refreshContent, setRefreshContent] = useState<boolean>(false);
    const [week, setWeek] = useState<number>(0);
    const handleChange = (event: { label: string, value: string }) => {
        setSelectedBatch(undefined);
        setTimeout(() => {
            if (event && event.value) {
                setSelectedBatch(event.value);
            }
        }, 100)

    }
    function getData() {
        axiosHttp.get(ApiConstants.admin.batchList()).then((res: AxiosResponse) => {
            if (res.data as { id: number, name: string }[]) {
                let data: { label: string, value: string }[] = [];
                res.data.forEach((single: { id: number, name: string }) => {
                    data.push({ label: single.name, value: single.name });
                });
                setBatch(data);
            }
        })
            .catch((err: Error) => {
                throw new Error(err.message)
            })
    }
    useEffect(() => {
        getData();
        let userData = authContext.getUserInfo()
        if (userData) {
            setProfileData(userData)
        }
    }, []);

    const openAddContentDialog = (week: number) => {
        setWeek(week + 1)
        setOpenDialog(true)
    }

    const handleCloseDialog = (value: any) => {
        setOpenDialog(false);
    }

    const handleAddVideoContent = (lesson: Lesson) => {
        if (lesson) {
            setRefreshContent(true)
            handleCloseDialog(true);
            getData();

        }
    }
    return <section className="min-h-[70svh] container text-[#222]">
        <div className="grid grid-cols-7 gap-3 items-center mb-4">
            <p className="col-span-3">Select the Batch to View Content of the specific batch</p>
            <div className="col-span-4">
                <MultiSelect multiple={false} options={batch} placeholder={'Choose Batch Name'}
                    label={'Select Batch'} handleChange={handleChange} />
            </div>
        </div>
        <Divider className="mb-4" />
        {selectedBatch ?
            <ProblemList isAdmin={true} openAddContent={openAddContentDialog} batchName={selectedBatch} refreshContent={refreshContent} /> : null}
        <CJDialog maxWidth="xl" isOpen={openDialog} title={`Add Content for Week: ${week}`} afterClosed={handleCloseDialog}>
            {selectedBatch ? <VideoUploader batchName={selectedBatch} weekNumber={week} handleResponse={handleAddVideoContent} clientId={profile?.client_id_vimeo} projectId={profile?.project_id_vimeo} /> : null}
        </CJDialog>
    </section>
}