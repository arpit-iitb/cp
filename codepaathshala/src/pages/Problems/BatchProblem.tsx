import SEO from "components/SEO";
import { useParams } from 'react-router-dom';
import { ActiveDays, LeaderBoard, LiveClass } from "../../_utils/interface";
import React, { useEffect, useState } from "react";
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
} from "@mui/material";
import axiosHttp from "../../_utils/axios.index";
import { ApiConstants } from "../../_utils/api-constants";
import { AxiosResponse } from "axios";
import ProblemList from './ProblemList';
import Divider from "@mui/material/Divider";
import { useAuth } from "hooks/AuthProvider";
import { BoltIcon, TrophyIcon } from "@heroicons/react/24/solid";


export default function BatchProblem() {
    const [leaderboardData, setLeaderboardData] = useState<LeaderBoard[]>()
    const [activeData, setActiveData] = useState<ActiveDays[]>([]);
    const [liveClass, setLiveClass] = useState<LiveClass>()
    const { batch_name } = useParams();
    const [loading, setLoading] = useState(true);
    const userContext = useAuth();

    useEffect(() => {
        getData();
        getLiveClasses();
        // eslint-disable-next-line
    }, []);

    function getData() {
        //getData by batchId
        if (batch_name) {
            axiosHttp.get(ApiConstants.leaderboard(batch_name)).then((res: AxiosResponse) => {
                setLeaderboardData(res.data);
            });
            axiosHttp.get(ApiConstants.activeDays(batch_name)).then((res: AxiosResponse) => {
                let data = res.data;
                data.sort((a: ActiveDays, b: ActiveDays) => a.rank - b.rank);
                setActiveData(data);
                setLoading(false);
            })
        }
    }
    function getLiveClasses() {
        axiosHttp.get(ApiConstants.liveclasses(batch_name)).then((res: AxiosResponse) => {
            setLiveClass(res.data[0]);
        });
    }

    const truncateText = (text: string, maxLength: number) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + '...';
    };

    function calculateDaysUntil(startDate: Date) {
        const today = new Date();
        const timeDiff = startDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (daysDiff > 0) {
            return `${daysDiff} day${daysDiff > 1 ? 's' : ''}`;
        } else if (daysDiff === 0) {
            return 'Today';
        } else {
            return 'Class has ended';
        }
    }
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    }

    return <>
        <SEO title={batch_name ? batch_name : "Batch Contents"} description={'CodePaathshala Problems'} />
        <section className="md:px-8 min-h-[70svh] sm:px-2">
            <div className="grid grid-cols-10 gap-6">
                <div className="col-span-12 lg:col-span-6">
                    <p className="text-3xl font-bold mb-3 text-[#222]">{batch_name ? batch_name : ""}</p>
                    {batch_name ? <ProblemList batchName={batch_name} /> : <p>Loading</p>}
                </div>
                <div className="col-span-12 lg:col-span-4 text-[#222]">
                    {liveClass?.meeting_id &&

                    <div className="mb-5">
                        <p className="text-3xl font-bold mb-3">Upcoming Live Class</p>

                        <div className="relative block w-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 flex justify-between">
                            {/* Details on the left */}
                            <div className="flex-grow pr-4">
                                <p className="font-semibold text-2xl text-secondary-500">{liveClass?.topic}</p>
                                <p>Class Duration: {liveClass?.duration} minutes</p>
                                <p className="text-md text-gray-600">
                                    Class Date: {formatDate(liveClass?.start_time as string)}
                                </p>

                            </div>

                            {/* Red dot and text on the right in a single line */}
                            <div className="flex items-center">
                                <span className="w-3 h-3 bg-red-500 rounded-full mr-2" aria-hidden="true"></span>
                                <div className="flex flex-col">
                                    <p className="font-semibold text-lg text-red-500">Live Class</p>
                                    {liveClass?.start_time && (
                                        <p className="text-sm text-gray-600">
                                            Starts in: {calculateDaysUntil(new Date(liveClass.start_time))}
                                        </p>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Button inside the card */}
                        <a
                            className="bg-primary-500 text-white p-3 rounded-xl mt-3 inline-block w-full text-center"
                            href={liveClass?.join_url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Join Now
                            <svg
                                className="rtl:rotate-180 w-3.5 h-3.5 ms-2 inline-block"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 14 10"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M1 5h12m0 0L9 1m4 4L9 9"
                                />
                            </svg>
                        </a>
                    </div>


                    }

                    <div className="flex flex-row items-start p-0 gap-1.5">

                        <TrophyIcon className="h-10 w-10 text-[#f9cd0c] rounded-full" />
                        <p className="text-3xl font-bold mb-3">Leaderboard</p>
                    </div>
                    {loading ? <div className="h-[250px] bg-gray-200 animate-pulse rounded-2xl">
                    </div> :
                        <TableContainer style={{ maxHeight: 350 }} className="border mb-6" elevation={0} component={Paper}>
                            <Table stickyHeader size="medium" aria-label="a dense table" sx={{ border: '1px solid rgba(217, 232, 255, 1)' }}>
                                <TableHead sx={{ backgroundColor: "#E6F0FF", color: "rgba(0, 31, 104, 0.5)" }}>
                                    <TableRow className="font-bold text-xl" >
                                        <TableCell sx={{ color: 'inherit', fontWeight: "inherit", fontSize: "inherit", backgroundColor: "#E6F0FF" }} align="center">Rank</TableCell>
                                        <TableCell sx={{ color: 'inherit', fontWeight: "inherit", fontSize: "inherit", backgroundColor: "#E6F0FF" }} align="center">Name</TableCell>
                                        <TableCell sx={{ color: 'inherit', fontWeight: "inherit", fontSize: "inherit", backgroundColor: "#E6F0FF" }} align="center">Score</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody >
                                    {leaderboardData?.map((leader: LeaderBoard) => (
                                        <TableRow
                                            className="!text-lg"
                                            hover={true}
                                            key={leader.rank}
                                            sx={{
                                                '&:last-child td, &:last-child th': { border: 0 },
                                                '& td, & th': { borderBottomColor: 'rgba(217,232,255,1)' },
                                                color: '#333',
                                                backgroundColor: `${leader.identifier === userContext.user.user.username ? '#E6F0FF' : 'none'}`
                                            }}
                                        >
                                            <TableCell sx={{ color: '#333', fontWeight: '700' }} align="center">
                                                {leader.rank === 1 ? (
                                                    <img src="/icons/Batch/first-icon.webp" alt="#1" className="h-7 w-7 inline-flex center" />
                                                ) : leader.rank === 2 ? (
                                                    <img src="/icons/Batch/second-icon.webp" alt="#2" className="h-7 w-7 inline-flex center" />
                                                ) : leader.rank === 3 ? (

                                                    <img src="/icons/Batch/third-icon.webp" alt="#3" className="h-7 w-7 inline-flex center" />
                                                ) : (
                                                    <span className="font-bold text-xl" >{`#${leader.rank}`}</span>
                                                )}
                                            </TableCell>


                                            <TableCell className="truncate overflow-hidden whitespace-nowrap" sx={{ color: '#333', fontWeight: 500, fontSize: 'inherit' }} align="left">
                                                <Tooltip title={leader.identifier === userContext.user.user.username ? 'You' : leader.username}>
                                                    <span>{leader.identifier === userContext.user.user.username ? 'You' : truncateText(leader.username, 30)}</span>
                                                </Tooltip>
                                            </TableCell>


                                            <TableCell sx={{ color: '#333', fontWeight: 'light', fontSize: "inherit" }} align="center">
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.1rem' }}>
                                                    <BoltIcon className="h-6 w-6 text-[#f9cd0c]" />
                                                    <span>{`${leader.total_score}`}</span>
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    }
                    <Divider />
                    <p className="text-3xl font-bold mt-4 mb-3">Active Days</p>
                    {loading ? <div className="h-[250px] bg-gray-200 animate-pulse rounded-2xl">
                    </div> :
                        <TableContainer style={{ maxHeight: 350 }} className="border mb-4" elevation={0} component={Paper}>
                            <Table stickyHeader size="medium" aria-label="a dense table" className="border border-[rgba(217,232,255,1)]">
                                <TableHead className="bg-[#E6F0FF] text-[rgba(0,31,104,0.5)]">
                                    <TableRow className="font-bold text-xl border border-[rgba(217,232,255,1)]">
                                        <TableCell sx={{ color: 'inherit', fontWeight: "inherit", fontSize: "inherit", backgroundColor: "#E6F0FF" }} align="center">Name</TableCell>
                                        <TableCell sx={{ color: 'inherit', fontWeight: "inherit", fontSize: "inherit", backgroundColor: "#E6F0FF" }} align="center">Active Days</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {activeData && activeData?.map((single) => (
                                        <TableRow
                                            className="!text-lg"
                                            hover={true}
                                            key={single.rank}
                                            sx={{
                                                '&:last-child td, &:last-child th': { border: 0 },
                                                '& td, & th': { borderBottomColor: 'rgba(217,232,255,1)' },

                                                color: '#333'
                                            }}
                                        >
                                            <TableCell sx={{ color: '#333', fontWeight: 500, fontSize: "inherit" }} align="center">{single.username}</TableCell>
                                            <TableCell sx={{ color: '#333', fontWeight: 500, fontSize: "inherit" }} align="center">{single.activeDays}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    }

                </div>
            </div>
        </section>
    </>
}