import { RegisteredBatchInterface } from "../../_utils/interface";
import { Card, CardContent, Tooltip } from "@mui/material";
import ProgressBar from "components/ProgressBar";
import { CommandLineIcon, DocumentTextIcon, ListBulletIcon, VideoCameraIcon } from "@heroicons/react/24/outline";
import { Link, useParams } from "react-router-dom";
import { BoltIcon } from "@heroicons/react/24/solid";
import { useEffect } from "react";
import { Logo } from "_utils/enum";
import { useAuth } from "hooks/AuthProvider";

export default function RegisteredBatch(props: RegisteredBatchInterface) {
    const authContext = useAuth();
    const { uid } = useParams();
    useEffect(() => {
        if (uid !== undefined) {

            localStorage.setItem("uid", uid as string)
            authContext.updateClientLogo(Logo[uid as keyof typeof Logo])
        }
    }, [])
    return <>
        <Card className="shadow-lg hover:shadow-2xl !rounded-2xl border border-solid border-[rgba(217,232,255,1)] w-full max-w-md mx-auto">
            <CardContent className="p-4 md:p-6 h-fit relative ">
                <div className="grid grid-flow-row auto-rows-max gap-2">
                    <div className="flex justify-between items-center">
                        <img alt={props.name} className="max-w-[50%] h-10" src={props.parent_batch_client_logo} />
                        <span className="inline-flex items-center justify-center p-1 mt-2 gap-1 px-2 text-secondary-500 text-xs h-8 w-auto bg-[#FFF8E0] rounded-[29px] border border-[#f9cd0c]">
                            <BoltIcon className="h-4 w-4 text-[#f9cd0c]" /> {props.total_score}
                        </span>
                    </div>
                    <Tooltip title={props.name}>
                        <p className="text-xl md:text-3xl font-bold overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.5', maxHeight: '3em', height: '3em', whiteSpace: 'normal', textOverflow: 'ellipsis' }}>
                            {props.name}
                        </p>
                    </Tooltip>
                    <ProgressBar count={parseFloat(((props.completed_lessons / props.total_lessons) * 100).toFixed(2))} showCount={true} />
                    <div className="flex items-center justify-center p-1 gap-2 px-2 text-sm text-primary-500 h-10 bg-[#E6F0FF] rounded-[29px]">
                        <VideoCameraIcon className="h-4 w-4 lg:h-6 lg:w-6 text-primary-500" />
                        <span className="lg:mr-2 text-secondary-500">{props.completed_videos}/{props.total_videos} </span>|
                        <CommandLineIcon className="h-4 w-4 lg:h-6 lg:w-6 text-primary-500" />
                        <span className="lg:mr-2 text-secondary-500"> {props.completed_problems}/{props.total_problems} </span>|
                        <ListBulletIcon className="h-4 w-4 lg:h-6 lg:w-6 text-primary-500" />
                        <span className="lg:mr-2 text-secondary-500">{props.completed_mcq_assignments}/{props.total_mcq_assignments} </span>|
                        <DocumentTextIcon className="h-4 w-4 lg:h-6 lg:w-6 text-primary-500" />
                        <span className="text-secondary-500">{props.completed_assignments}/{props.total_assignments}</span>
                    </div>

                    <div className="flex justify-end mt-4">
                        <Link to={'/problems/' + props.name}>
                            <button className="border rounded-lg px-4 py-2 md:px-4 md:py-3 transition bg-primary-500 text-white hover:bg-white hover:border-primary-500 hover:text-primary-500">
                                Go to Course
                            </button>
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>

    </>
}