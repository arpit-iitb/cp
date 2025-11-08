import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useEffect, useRef, useState } from "react";

export default function SectionTimer({ totalTime, timeOverCallback }: { totalTime?: number, timeOverCallback: () => void, }) {
    const [min, setMin] = useState(0);
    const [sec, setSec] = useState(0);
    const [hour, setHour] = useState(0);
    const [timerID, setTimerID] = useState<any>();

    const Ref = useRef<any>(null);

    const [endTime, setEndTime] = useState<Date>();
    useEffect(() => {
        let storedSectionTime = sessionStorage.getItem("endTimeSection")
        if (storedSectionTime) {
            if (storedSectionTime && storedSectionTime.length > 0) {
                setAssessmentEndTime(new Date(JSON.parse(storedSectionTime)))
                return;
            }
        }
        else {
            let nowDateObj = new Date();
            nowDateObj.setSeconds(nowDateObj.getSeconds() + (totalTime as number * 60));
            setAssessmentEndTime(nowDateObj);


        }

        return () => {
            clearTime();
        }
    }, []);

    function startTimer() {
        if (Ref.current) clearInterval(Ref.current);
        const id = setInterval(() => {

            let time = getRemainingSecs();

            if (!time) {
                timeOverCallback();
                clearTime();
                return;
            }
            setTimerUI(time);
        }, 1000);
        Ref.current = id;
        setTimerID(id);
    }

    function setAssessmentEndTime(date: Date) {
        sessionStorage.setItem("endTimeSection", JSON.stringify(date))
        setEndTime(date);
        setRemainingTime(date);
        startTimer();
    }

    function setRemainingTime(date: any) {
        const diffSeconds = new Date(date).getTime() / 1000 - new Date().getTime() / 1000;
        setTimerUI(diffSeconds);
    }

    function getRemainingSecs() {
        let storedEndTime = sessionStorage.getItem("endTimeSection");
        if (storedEndTime) {
            const diffSeconds = new Date(JSON.parse(storedEndTime)).getTime() / 1000 - new Date().getTime() / 1000;
            return Math.floor(diffSeconds);
        }
    }

    function setTimerUI(seconds: number) {
        setHour(Math.floor(seconds / 3600));
        setMin(Math.floor(seconds % 3600 / 60));
        setSec(Math.floor(seconds % 3600 % 60));
    }

    function clearTime() {
        clearInterval(timerID);
    }
    return <>
        <div className="rounded-lg flex gap-1 items-center py-1 pe-3 px-2 border border-green-300 bg-green-100 w-28">
            <AccessTimeIcon fontSize="small" /><div>{hour < 10 ? `0${hour}` : hour}:{min < 10 ? `0${min}` : min}:{sec < 10 ? `0${sec}` : sec}</div>
        </div>
    </>
}