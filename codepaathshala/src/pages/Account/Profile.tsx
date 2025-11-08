import { Card, CardContent, SvgIcon, } from "@mui/material";
import { Tooltip as Tool } from "@mui/material"
import Divider from '@mui/material/Divider';
import { Link, useNavigate } from "react-router-dom";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MilitaryTechOutlinedIcon from '@mui/icons-material/MilitaryTechOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import SEO from "components/SEO";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import axiosHttp from "../../_utils/axios.index";
import { ApiConstants } from "../../_utils/api-constants";
import { AxiosResponse } from "axios";
import { ProfileDataInterface, SingleDateInterface } from "../../_utils/interface";
import CalHeatmap from "cal-heatmap";
import 'cal-heatmap/cal-heatmap.css';
// @ts-ignore
import Tooltip from 'cal-heatmap/plugins/Tooltip';
import ProgressBar from "components/ProgressBar";
import { AssessmentStatus } from "../../_utils/enum";
import { useAuth } from "hooks/AuthProvider";
// eslint-disable-next-line

export default function Profile() {
    const route = useNavigate()
    // eslint-disable-next-line
    const cal: CalHeatmap = new CalHeatmap();
    const authContext = useAuth();
    const [profile, setProfile] = useState<ProfileDataInterface | null>(null);
    // added heatmap
    const heatmapRef = useRef<any>('div#cal-heatmap');
    const [isGraphLoaded, setIsGraphLoaded] = useState(false);
    const element = document.getElementById('cal-heatmap');
    useEffect(() => {
        authContext.updateClientLogo("");

        axiosHttp.get(ApiConstants.accounts.profileDetails)
            .then((res: AxiosResponse) => {
                setProfile(res.data);
            })
        // eslint-disable-next-line
    }, []);
    let date = profile?.created_at?.split('T')[0];

    const options: any = {
        itemSelector: "#cal-heatmap",
        range: 12,
        tooltip: true,
        date: { start: date, highlight: [new Date()] },
        domain: { type: 'month', gutter: 10, radius: 10 },
        subDomain: { type: 'day', gutter: 4, radius: 10 },
        data: {
            defaultValue: 0,
            source: profile?.submission_count_by_date,
            x: 'date', y: "value"
        },
        scale: { color: { type: 'diverging', scheme: 'PRGn', domain: [-10, 15] } },
        verticalOrientation: false,
        displayLegend: true,
        theme: "dark"
    };
    cal.paint(options,
        [[
            Tooltip,
            {
                text: function (date: any, value: any, dayjsDate: any) {
                    return (
                        (value ? value : 'No') +
                        ' submissions on ' +
                        dayjsDate.format('dddd, MMMM D, YYYY')
                    );
                },
            } as any
        ]]
    );



    function handleResumeBuilder() {
        route("/account/resume-builder")
    }

    return <>
        <SEO title={'Profile'} description={'CodePaathshala Profile'} />
        {profile ? <>
            <section className="min-h-[70svh] container mb-4">
                <div className="grid grid-cols-1 md:grid-cols-7 gap-5">
                    <div className="md:col-span-2">
                        <div className="grid grid-cols-1 gap-5">
                            <Card variant="outlined" className="!border-none !rounded-md !drop-shadow-lg">
                                <CardContent>
                                    <div className="flex justify-end mb-4 text-sm">
                                        <Link className="flex items-center text-blue-700 hover:underline transition"
                                            to="/account/edit-profile"><EditOutlinedIcon /> Edit Profile</Link>
                                    </div>
                                    <div className="grid grid-cols-1">
                                        <div className="flex justify-center items-center mb-2 md:mb-4">
                                            <div className="bg-purple-400 text-white text-4xl rounded-full p-8">
                                                <p>{profile.user.name ? profile.user.name.split(" ").map((s) => s.charAt(0).toUpperCase()) :
                                                    profile.user.username.charAt(0).toUpperCase()
                                                }</p>
                                            </div>
                                        </div>
                                        <div className="mb-2 md:mb-4">
                                            <p className="font-bold text-lg text-center md:mb-2">{profile.user.name ?? profile.user.username}</p>
                                            <p className="text-center">{profile.program}</p>
                                        </div>
                                        <div className="flex justify-evenly items-center">
                                            <p><TrendingUpOutlinedIcon className="text-green-700" /> <span
                                                className="text-primary-500 font-bold">Streak:</span> {profile.streak}
                                            </p>
                                            <p><MilitaryTechOutlinedIcon className="text-green-700" /> <span
                                                className="text-primary-500 font-bold">Score:</span> {profile.total_Score}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card variant="outlined" className="!border-none !rounded-md !drop-shadow-lg !bg-blue-100">
                                <CardContent>
                                    <div onClick={handleResumeBuilder} className="cursor-pointer flex justify-center font-bold text-blue-800">Build your Resume</div>
                                </CardContent>
                            </Card>
                            <Card variant="outlined" className="!border-none !rounded-md !drop-shadow-lg">
                                <CardContent>
                                    <div className="flex justify-between items-center mb-3">
                                        <a target="_blank" rel="noopener noreferrer" href={profile.linkedin_url}>
                                            <SvgIcon>
                                                <svg aria-hidden="true" focusable="false"
                                                    data-prefix="fab" data-icon="linkedin" role="img"
                                                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"
                                                    data-fa-i2svg="">
                                                    <path fill="currentColor"
                                                        d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"></path>
                                                </svg>
                                            </SvgIcon>
                                        </a>
                                        <p>LinkedIn</p>
                                    </div>
                                    <Divider />
                                    <div className="flex justify-between items-center mt-3">
                                        <a target="_blank" rel="noopener noreferrer" href={profile.github_url}>
                                            <SvgIcon>
                                                <svg aria-hidden="true" focusable="false"
                                                    data-prefix="fab" data-icon="github" role="img"
                                                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"
                                                    data-fa-i2svg="">
                                                    <path fill="currentColor"
                                                        d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path>
                                                </svg>
                                            </SvgIcon>
                                        </a>
                                        <p>Github</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                    <div className="md:col-span-5">
                        <div className="grid grid-cols-6 gap-5 text-[#222]">
                            <div className="col-span-6">
                                <Card elevation={0} className="!rounded-md !drop-shadow-lg">
                                    <CardContent>
                                        <div className="grid grid-cols-5 mb-4">
                                            <div className="col-span-1">
                                                <p className="font-bold">Name</p>
                                            </div>
                                            <div className="col-span-4">
                                                <p>{profile.user.name ?? profile.user.username}</p>
                                            </div>
                                        </div>
                                        <Divider />
                                        <div className="grid grid-cols-5 mt-4">
                                            <div className="col-span-1">
                                                <p className="font-bold">Email</p>
                                            </div>
                                            <div className="col-span-4">
                                                <p>{profile.user.email}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="col-span-6 md:col-span-3">
                                <Card elevation={0} className="!rounded-md !drop-shadow-lg">
                                    <CardContent>
                                        <div>
                                            <p className="mb-3"><em className="text-primary-500">Code</em> Submissions
                                            </p>
                                            {profile.recent_problems.map((single) =>
                                                <Tool placement="left-start" title={'Passed'} key={single?.title}>
                                                    <div className="text-sm mb-3">
                                                        <p className="font-light mb-1">{single.title}</p>
                                                        <ProgressBar height={5}
                                                            color={single.judgment === AssessmentStatus.PASSED ? "green" : "yellow"}
                                                            count={single.judgment === AssessmentStatus.PASSED ? 100 : 45}
                                                            showCount={false} />
                                                    </div>
                                                </Tool>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="col-span-6 md:col-span-3">
                                <Card elevation={0} className="!rounded-md !drop-shadow-lg">
                                    <CardContent>
                                        <div>
                                            <p className="mb-3"><em className="text-primary-500">Recent</em> Problems</p>
                                            {profile.recent_problems.map((single) =>
                                                <Tool placement="left-start" title={'Attempted and Passed'} key={single?.title}>
                                                    <div className="text-sm mb-3">
                                                        <p className="font-light mb-1">{single.title}</p>
                                                        <ProgressBar height={5}
                                                            color="blue"
                                                            count={100}
                                                            showCount={false} />
                                                    </div>
                                                </Tool>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="col-span-6">
                                <Card elevation={0} className="!rounded-md !drop-shadow-lg">
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4">
                                            <p className="font-bold text-lg">Total Submissions: <span
                                                className="text-blue-700">{profile?.total_submissions}</span></p>
                                            <p className="font-bold text-lg">Max Streaks: <span
                                                className="text-blue-700">{profile.max_streak}</span></p>
                                            <p className="font-bold text-lg">Total Problems Solved: <span
                                                className="text-blue-700">{profile.solved_problems.length}</span></p>
                                            <p className="font-bold text-lg">Your Rank: <span
                                                className="text-blue-700">{profile?.total_Score}</span></p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="col-span-6">
                                <Card elevation={0} className="!rounded-md !drop-shadow-lg">
                                    <CardContent>
                                        <div id={"cal-heatmap"} ref={heatmapRef} ></div>


                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </> : <>
            Loading...
        </>
        }

    </>;
}