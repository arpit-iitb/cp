import { AdminCardDataInterface, BatchStatsResponse, LeaderBoard, TimeSpentResponse, StatsForm } from "_utils/interface";
import SEO from "components/SEO";
import DataCard from "components/cards/dataCard";
import { useEffect, useState } from "react";
import { Data, DataBar, DataBarSingle, DataDount } from "./data";
import BarChart from "components/Charts/BarChart";
import LineChart from "components/Charts/LineChart";
import DoughnutChart from "components/Charts/Doughnut";
import axiosHttp from "_utils/axios.index";
import { ApiConstants } from "_utils/api-constants";
import { AxiosResponse } from "axios";
import User from "assets/images/user.png"
import Clock from "assets/images/clock.png"
import Tv from "assets/images/tv.png";
import Calender from "assets/svg/Calender.svg"
import CalenderPrimary from "assets/svg/Calender-primary.svg"
import { Modal, Button, Box } from '@mui/material';
import Login from "assets/images/arrow-left-end-on-rectangle.png"
import { useAuth } from "hooks/AuthProvider";
import { BoltIcon, CommandLineIcon, DocumentTextIcon, ListBulletIcon, VideoCameraIcon } from "@heroicons/react/24/outline";
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Tooltip } from "@mui/material";
// Chart.register(CategoryScale);
function AdminDashboard({ studentDashboard, userName, batch_Name }: { studentDashboard?: boolean, userName?: string, batch_Name?: string }) {
    const userContext = useAuth();
    const [cardData, setCardData] = useState<AdminCardDataInterface[]>()
    const [batchName, setBatchName] = useState<{ label: string, value: string }[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<string>()
    const [LineChartData, setLineChartData] = useState<any>(Data);
    const [BarChartData, setBarChartData] = useState<any>(DataBar);
    const [SingleBarChartData, setSingleBarChartData] = useState<any>(DataBarSingle);
    const [DonutChartData, setDonutChartData] = useState<any>(DataDount);
    const [leaderboardData, setLeaderboardData] = useState<LeaderBoard[]>()
    const [totalStats, setTotalStats] = useState<StatsForm>()
    const [startDate, setStartDate] = useState<string>();
    const [maxEndDate, setMaxEndDate] = useState<string>();
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [activeFilter, setActiveFilter] = useState<string>("Weekly")
    const [isModalOpen, setIsModalOpen] = useState(false);
    useEffect(() => {
        if (!studentDashboard) {
            getDataBatch(false)

        }
        else {
            setSelectedBatch(batch_Name)
            getSingleDataBatch(batch_Name as string, false)
        }
    },
        [])

    function getMonthlyData() {
        setStartDate('')
        const now = new Date();
        const oneWeekAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        setStartDate(oneWeekAgo.toISOString().split('T')[0])
        setEndDate(new Date().toISOString().split('T')[0])
        if (startDate) {
            setActiveFilter("Monthly")
            setTimeout(() => {
                getSingleDataBatch(selectedBatch as string, true)
            }, 1000)
        }


    }

    function getWeeklyData() {
        setActiveFilter("Weekly")
        getSingleDataBatch(selectedBatch as string)

    }
    function handleSelectChange(event: any) {
        setActiveFilter("Weekly")
        setSelectedBatch(event?.target?.value)
        getSingleDataBatch(event?.target?.value)
    }

    function getData(selectedBatch: string) {
        setLeaderboardData([])
        axiosHttp.get(`${ApiConstants.leaderboard(selectedBatch)}`)
            .then((res: AxiosResponse) => {
                setLeaderboardData(res.data);
            })
            .catch((err) => {
                console.error(err);
            });

    }

    const truncateText = (text: string, maxLength: number) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + '...';
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleStartDateChange = (event: any) => {
        setStartDate(event.target.value);
        const maxEndDate = new Date(new Date(event.target.value).getTime() + 60 * 24 * 60 * 60 * 1000);
        setMaxEndDate(maxEndDate.toISOString().split('T')[0])
        setEndDate('')
    };

    const handleEndDateChange = (event: any) => {
        setEndDate(event.target.value);
    };

    const handleApplyCustomRange = () => {
        setActiveFilter("Custom")
        getSingleDataBatch(selectedBatch as string, true)

        handleCloseModal();
    };

    function getDataBatch(data?: boolean) {
        setBatchName([])
        setActiveFilter('Weekly')
        setStartDate('')

        axiosHttp.get(ApiConstants.admin.batchList()).then((res: AxiosResponse) => {
            if (res.data as { id: number, name: string }[]) {
                let data: { label: string, value: string }[] = [];
                res.data.forEach((single: { id: number, name: string }) => {
                    data.push({ label: single.name, value: single.name });
                });
                setBatchName(data);
                setSelectedBatch(data[0]?.value)
                getSingleDataBatch(data[0]?.value, data)
            }
        })
            .catch((err: Error) => {
                throw new Error(err.message)
            })
    }



    // Function to fetch batch data and update card data
    function fetchBatchData(batch_name: string, data?: boolean): Promise<BatchStatsResponse> {
        let dataObj: any = {
            batch: [batch_name]
        };
        if (data) {
            dataObj["start"] = startDate
            dataObj["end"] = endDate;
        }

        return axiosHttp.post(ApiConstants.admin.getBatchStats(), dataObj)
            .then(response => response.data)
            .catch(error => {
                console.error("Error fetching batch data:", error.message);
                throw error;
            });
    }

    // Function to fetch time spent data and update line chart data
    function fetchTimeSpentData(batch_name: string, data?: boolean): Promise<TimeSpentResponse> {
        let dataObj: any = {
            batch: [batch_name]
        };
        if (data) {
            dataObj["start"] = startDate
            dataObj["end"] = endDate;
        }
        return axiosHttp.post(ApiConstants.admin.getTimeSpentInfo(), dataObj)
            .then(response => response.data)
            .catch(error => {
                console.error("Error fetching time spent data:", error.message);
                throw error;
            });
    }

    // Function to fetch batch data and update card data
    function fetchBatchStudentData(batch_name: string, data?: boolean): Promise<BatchStatsResponse> {
        let dataObj: any = {
            batch: batch_name,
            student: userName
        };
        if (data) {
            dataObj["start"] = startDate
            dataObj["end"] = endDate;
        }

        return axiosHttp.post(ApiConstants.admin.getBatchStatsUser(), dataObj)
            .then(response => response.data)
            .catch(error => {
                console.error("Error fetching batch data:", error.message);
                throw error;
            });
    }

    // Function to fetch time spent data and update line chart data
    function fetchTimeSpentStudentData(batch_name: string, data?: boolean): Promise<TimeSpentResponse> {
        let dataObj: any = {
            batch: batch_name,
            student: userName
        };
        if (data) {
            dataObj["start"] = startDate
            dataObj["end"] = endDate;
        }
        return axiosHttp.post(ApiConstants.admin.getTimeStatsUser(), dataObj)
            .then(response => response.data)
            .catch(error => {
                console.error("Error fetching time spent data:", error.message);
                throw error;
            });
    }

    function formatUserActivityData(userActivity: { [date: string]: { P: number; A: number; M: number; V: number } }) {
        const userActivityDates = Object.keys(userActivity);
        const formattedDates = userActivityDates.map(dateString => {
            const date = new Date(dateString);
            return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
        });
        const activities = Object.values(userActivity);
        const P = activities.map(activity => activity.P);
        const A = activities.map(activity => activity.A);
        const M = activities.map(activity => activity.M);
        const V = activities.map(activity => activity.V);

        return { formattedDates, P, A, M, V };
    }

    function formatTimeActivityData(userActivity: any) {
        const userActivityDates = Object.keys(userActivity);
        const formattedWeeklyDates = userActivityDates.map(dateString => {
            const date = new Date(dateString);
            return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
        });
        const graphDataYais = Object.values(userActivity)
        const timeSpentNumbers = graphDataYais.map((value: any) => parseFloat(value));
        return { formattedWeeklyDates, timeSpentNumbers };
    }

    function formatSingleTimeActivityData(userActivity: any) {
        const userActivityDates = Object.keys(userActivity);
        const formattedSingleDates = userActivityDates.map(dateString => {
            const date = new Date(dateString);
            return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
        });
        const graphDataYais = Object.values(userActivity)
        const timeSpentSingleNumbers = graphDataYais.map((value: any) => parseFloat(value));
        return { formattedSingleDates, timeSpentSingleNumbers };
    }
    function updateBarChartData(barChartData: any, formattedDates: string[], P: number[], A: number[], M: number[], V: number[]) {
        const updatedBarChartData = {
            ...barChartData,
            options: {
                ...barChartData.options,
                xaxis: {
                    categories: formattedDates
                }
            },
            series: [
                { data: V },
                { data: M },
                { data: P },
                { data: A }
            ]
        };

        return updatedBarChartData;
    }

    // Function to update line chart data for weekly time spent
    function updateLineChartData(lineChartData: any, formattedDates: string[], timeSpentNumbers: number[]) {
        const updatedLineChartData = {
            ...lineChartData,
            options: {
                ...lineChartData.options,
                xaxis: {
                    categories: formattedDates
                }
            },
            series: [{
                data: timeSpentNumbers
            }]
        };

        return updatedLineChartData;
    }

    function updateSingleBarChartData(singleBarChartData: any, formattedDates: string[], timeSpentNumbers: number[]) {
        const updatedLineChartData = {
            ...singleBarChartData,
            options: {
                ...singleBarChartData.options,
                xaxis: {
                    categories: formattedDates
                }
            },
            series: [{
                data: timeSpentNumbers
            }]
        };

        return updatedLineChartData;
    }

    function updateDonutChartData(donutChartData: any, batchResponse: any) {
        const dataResponse = 100 - batchResponse;
        console.info(batchResponse, dataResponse, 310)
        const updatedDonutChartData = {
            ...donutChartData,
            options: {
                ...donutChartData.options,

            },
            series: [batchResponse, dataResponse]
        };

        return updatedDonutChartData;
    }
    const getDateDifference = (start: string, end: string): number => {
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new Error('Invalid date format');
        }

        const differenceInTime = endDate.getTime() - startDate.getTime();
        const differenceInDays = differenceInTime / (1000 * 3600 * 24);
        return differenceInDays;
    };
    function getSingleDataBatch(batch_name: string, data?: any) {
        if (!studentDashboard) {
            Promise.all([
                fetchBatchData(batch_name, data),
                fetchTimeSpentData(batch_name, data),
                getData(batch_name)
            ])
                .then(([batchStatsResponse, timeSpentResponse]) => {
                    let periodText;
                    console.info(activeFilter)
                    if (activeFilter === "Weekly") {
                        periodText = '7 days';
                    } else if (activeFilter === "Monthly") {
                        periodText = 'Month';
                    } else {
                        const daysCount = getDateDifference(startDate as string, endDate);
                        periodText = `${daysCount} days`;
                    }
                    const tooltips = {
                        totalStudents: `Total number of students enrolled`,
                        activeStudents: `Total number of active students (logged in at least once in the last ${periodText})`,
                        timeSpent: `Cumulative time spent on the platform by the students in the last ${periodText}`,
                        dailyLogins: `Average number of users logging in the last ${periodText}`
                    };
                    setCardData([
                        { title: "Number of Students", icon: User, data: batchStatsResponse.total_user_count, tooltip: tooltips.totalStudents },
                        { title: "Active Students", icon: Tv, data: batchStatsResponse.active_users, tooltip: tooltips.activeStudents },
                        { title: "Time Spent by Student", icon: Clock, data: `${timeSpentResponse.aggregate_time} hrs`, tooltip: tooltips.timeSpent },
                        { title: "Student daily logins", icon: Login, data: Math.ceil(timeSpentResponse.average_daily_distinct_users), tooltip: tooltips.dailyLogins }
                    ]);
                    const { formattedDates, P, A, M, V } = formatUserActivityData(batchStatsResponse.user_activity);
                    const updatedBarChartData = updateBarChartData(BarChartData, formattedDates, P, A, M, V);
                    setBarChartData(updatedBarChartData);
                    setTotalStats({
                        total_mcq_assignment: batchStatsResponse.total_mcq_assignment,
                        total_problem: batchStatsResponse.total_problem,
                        total_videos: batchStatsResponse.total_videos,
                        total_assignment: batchStatsResponse.total_assignment
                    })
                    const { formattedSingleDates, timeSpentSingleNumbers } = formatSingleTimeActivityData(timeSpentResponse.distinct_user)
                    const { formattedWeeklyDates, timeSpentNumbers } = formatTimeActivityData(timeSpentResponse.time_spent);
                    const updatedLineChartData = updateLineChartData(LineChartData, formattedWeeklyDates, timeSpentNumbers);
                    setLineChartData(updatedLineChartData);
                    const upadatedDonutChartData = updateDonutChartData(DonutChartData, batchStatsResponse.completion_percent)
                    setDonutChartData(upadatedDonutChartData)
                    const updatedSingleBarChartData = updateSingleBarChartData(SingleBarChartData, formattedSingleDates, timeSpentSingleNumbers)
                    setSingleBarChartData(updatedSingleBarChartData)

                })
                .catch((error) => {
                    console.error("Error fetching data:", error.message);
                });
        }
        else {
            console.info("came here", 388)
            Promise.all([
                fetchBatchStudentData(batch_name, data),
                fetchTimeSpentStudentData(batch_name, data),
            ])
                .then(([batchStatsResponse, timeSpentResponse]) => {
                    let periodText;
                    console.info(activeFilter)
                    if (activeFilter === "Weekly") {
                        periodText = '7 days';
                    } else if (activeFilter === "Monthly") {
                        periodText = 'Month';
                    } else {
                        const daysCount = getDateDifference(startDate as string, endDate);
                        periodText = `${daysCount} days`;
                    }
                    const tooltips = {
                        totalStudents: `Current User`,
                        activeStudents: `Total number of active student (logged in at least once in the last ${periodText})`,
                        timeSpent: `Cumulative time spent on the platform by the student in the last ${periodText}`,
                        dailyLogins: `Average number of users logging in the last ${periodText}`
                    };
                    setCardData([
                        { title: "User Count", icon: User, data: batchStatsResponse.total_user_count, tooltip: tooltips.totalStudents },
                        // { title: "Active", icon: Tv, data: batchStatsResponse.active_users, tooltip: tooltips.activeStudents },
                        { title: "Time Spent by Student", icon: Clock, data: `${timeSpentResponse.aggregate_time} hrs`, tooltip: tooltips.timeSpent },
                        // { title: "Student daily logins", icon: Login, data: Math.ceil(timeSpentResponse.average_daily_distinct_users), tooltip: tooltips.dailyLogins }
                    ]);
                    const { formattedDates, P, A, M, V } = formatUserActivityData(batchStatsResponse.user_activity);
                    const updatedBarChartData = updateBarChartData(BarChartData, formattedDates, P, A, M, V);
                    setBarChartData(updatedBarChartData);
                    setTotalStats({
                        total_mcq_assignment: batchStatsResponse.total_mcq_assignment,
                        total_problem: batchStatsResponse.total_problem,
                        total_videos: batchStatsResponse.total_videos,
                        total_assignment: batchStatsResponse.total_assignment
                    })
                    const { formattedWeeklyDates, timeSpentNumbers } = formatTimeActivityData(timeSpentResponse.time_spent);
                    const updatedLineChartData = updateLineChartData(LineChartData, formattedWeeklyDates, timeSpentNumbers);
                    setLineChartData(updatedLineChartData);
                    const upadatedDonutChartData = updateDonutChartData(DonutChartData, batchStatsResponse.completion_percent)
                    setDonutChartData(upadatedDonutChartData)

                })
                .catch((error) => {
                    console.error("Error fetching data:", error.message);
                });
        }

    }
    return <>
        <SEO title={'Admin Dashboard | CodePaathshala'} description={'Problems'} />
        <div className="flex flex-col md:flex-row md:justify-between items-center mb-4 px-4">
            {!studentDashboard ? (
                <div className="mb-2 md:mb-0">
                    <select
                        id="batchName"
                        name="batchName"
                        aria-label="Select Batch Name"
                        className="form-select bg-primary-50  text-secondary-500 rounded-md px-3 py-1 focus:outline-none"
                        onChange={handleSelectChange}
                    >
                        {batchName.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
            ) :
                <>
                    <div className="mb-2 md:mb-0">
                        User: <span className="text-secondary-500 text-2xl">{userName}</span>
                    </div>
                </>}

            <div className="flex flex-wrap gap-2 items-center text-xs font-medium">
                <div
                    className={`cursor-pointer ${activeFilter === "Weekly" ? "text-primary-500" : "text-secondary-500"}  text-sm`}
                    onClick={getWeeklyData}
                >
                    Weekly
                </div>
                <div
                    className={`cursor-pointer ${activeFilter === "Monthly" ? "text-primary-500" : "text-secondary-500"}  text-sm`}
                    onClick={getMonthlyData}
                >
                    <span>|</span> Monthly <span>|</span>
                </div>
                {['Weekly', 'Monthly'].includes(activeFilter) && (
                    <div
                        className={`cursor-pointer ${activeFilter === "Custom" ? "text-primary-500" : "text-secondary-500"}  text-sm flex items-center gap-1`}
                        onClick={handleOpenModal}
                    >
                        <img src={Calender} alt="Calendar icon" className="w-4 h-4" />
                        Custom
                    </div>
                )}
                {activeFilter !== 'Weekly' && activeFilter !== 'Monthly' && (
                    <>
                        <div className="text-primary-500 flex items-center gap-2">
                            <span className="flex"> <img src={CalenderPrimary} alt="Calendar icon" className="w-4 h-4 me-2" />Custom</span>
                            <p className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-sm font-medium text-primary-600 ring-2 ring-primary-500/10 cursor-pointer">
                                From: {startDate}
                            </p>
                            <p className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-sm font-medium text-primary-600 ring-2 ring-primary-500/10 cursor-pointer">
                                To: {endDate}
                            </p>
                        </div>
                        <span
                            className="inline-flex items-center rounded-xl bg-primary-500 px-2 py-1 text-sm font-medium text-white cursor-pointer mt-1"
                            onClick={getWeeklyData}
                        >
                            Clear
                        </span>
                    </>
                )}
            </div>
        </div>

        {batchName && selectedBatch ? (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3 mx-3 xs:grid-cols-1">
                    {cardData && cardData.map((single, index) => <DataCard key={index} {...single} />)}
                </div>
                <hr className="!border-primary-100" />
                <div className="grid grid-cols-12 gap-4 mx-3 align-center justify-center mt-1">
                    <div className="col-span-12 sm:col-span-6 lg:col-span-5 mb-4 shadow rounded-xl" style={{ boxSizing: 'border-box', display: 'block', maxWidth: '100%', height: 'auto' }}>
                        {LineChartData && <LineChart chartData={LineChartData} />}
                    </div>
                    <div className="col-span-12 sm:col-span-6 lg:col-span-4 mb-4 shadow rounded-xl" style={{ boxSizing: 'border-box', display: 'block', maxWidth: '100%', height: 'auto' }}>
                        {BarChartData && <BarChart chartData={BarChartData} title={"Student Daily Activity →"} />}
                    </div>
                    <div className="col-span-12 sm:col-span-6 lg:col-span-3 mb-4" style={{ boxSizing: 'border-box', display: 'block', maxWidth: '100%', height: 'auto' }}>
                        {DonutChartData && <DoughnutChart chartData={DonutChartData} />}
                    </div>
                    {!studentDashboard ? (
                        <div className="col-span-12 sm:col-span-6 lg:col-span-5 mb-4" style={{ boxSizing: 'border-box', display: 'block', maxWidth: '100%', height: 'auto' }}>
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
                        </div>
                    ) : null}
                    {!studentDashboard ? (
                        <div className="col-span-12 sm:col-span-6 lg:col-span-4 mb-4 shadow rounded-xl" style={{ boxSizing: 'border-box', display: 'block', maxWidth: '100%', height: 'auto' }}>
                            {SingleBarChartData && <BarChart chartData={SingleBarChartData} title={"Student Logins →"} />}
                        </div>
                    ) : null}
                    {!studentDashboard ? (
                        <div className="col-span-12 sm:col-span-6 lg:col-span-3 mb-4 flex flex-col gap-4 shadow rounded-xl p-3" style={{ boxSizing: 'border-box', maxWidth: '100%' }}>
                            {totalStats?.total_videos !== undefined && (
                                <div className="flex justify-between items-center space-x-2">
                                    <div className="flex items-center">
                                        <VideoCameraIcon className="h-7 w-7 text-secondary-500" />
                                        <span className="text-secondary-500 text-xl ml-2">Videos</span>
                                    </div>
                                    <span className="text-secondary-500 text-2xl font-bold">{totalStats.total_videos}</span>
                                </div>
                            )}
                            {totalStats?.total_mcq_assignment !== undefined && (
                                <div className="flex justify-between items-center space-x-2">
                                    <div className="flex items-center">
                                        <ListBulletIcon className="h-7 w-7 text-secondary-500" />
                                        <span className="text-secondary-500 text-xl ml-2">MCQ's</span>
                                    </div>
                                    <span className="text-secondary-500 text-2xl font-bold">{totalStats.total_mcq_assignment}</span>
                                </div>
                            )}
                            {totalStats?.total_problem !== undefined && (
                                <div className="flex justify-between items-center space-x-2">
                                    <div className="flex items-center">
                                        <CommandLineIcon className="h-7 w-7 text-secondary-500" />
                                        <span className="text-secondary-500 text-xl ml-2">Problems</span>
                                    </div>
                                    <span className="text-secondary-500 text-2xl font-bold">{totalStats.total_problem}</span>
                                </div>
                            )}
                            {totalStats?.total_assignment !== undefined && (
                                <div className="flex justify-between items-center space-x-2">
                                    <div className="flex items-center">
                                        <DocumentTextIcon className="h-6 w-6 text-secondary-500" />
                                        <span className="text-secondary-500 text-xl ml-2">Assignment</span>
                                    </div>
                                    <span className="text-secondary-500 text-2xl font-bold">{totalStats.total_assignment === 0 ? '0' : totalStats.total_assignment}</span>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </>
        ) : null
        }

        <Modal
            open={isModalOpen}
            onClose={handleCloseModal}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            sx={{
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
            }}
        >
            <Box sx={{ width: '40%', maxWidth: '320px', mx: 'auto', my: '30vh', p: '2rem', background: "#FFFFFF" }}>
                <div className="text-secondary-500 text-2xl font-bold flex justify-center mb-4">
                    Custom Range
                </div>
                <div className="flex justify-center flex-col items-center gap-4 mx-3">
                    <label className="text-secondary-500 text-md font-bold self-start">Pick- From date</label>
                    <input id="default-datepicker" value={startDate}
                        onChange={handleStartDateChange} type="date"
                        className="bg-primary-50 border border-gray-300 text-secondary-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-60 p-2.5"
                        placeholder="Select Start date"
                    />
                    <label className="text-secondary-500 text-md font-bold self-start">Pick- To date</label>
                    <input id="default-datepicker" value={endDate} max={maxEndDate}
                        onChange={handleEndDateChange} type="date"
                        className="bg-primary-50 border border-gray-300 text-secondary-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-60 p-2.5"
                        placeholder="Select End date"
                    />
                </div>

                <div className="mt-5 flex justify-center">
                    <Button variant="contained" className="!normal-case !bg-primary-500 !w-60" onClick={handleApplyCustomRange}>
                        Apply
                    </Button>
                </div>
            </Box>
        </Modal>


    </>
}
export default AdminDashboard;