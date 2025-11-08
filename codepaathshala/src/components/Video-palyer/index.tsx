import { useRef, useState, useEffect, useMemo } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./video.css";
import axiosHttp from "_utils/axios.index";
import { ApiConstants } from "_utils/api-constants";
import ReactPlayer from "react-player/lazy";

function VideoPlayer({ firstTime, link, id, batchName, duration }: { firstTime: boolean, id: any, link?: string, batchName?: string, duration?: string }) {
    const [currentTime, setCurrentTime] = useState(0);
    const [toastDisplayed, setToastDisplayed] = useState(false);
    const videoRef = useRef<any>(null);
    const [scoreSent, setScoreSent] = useState({
        20: false,
        40: false,
        60: false,
        80: false,
    });
    const convertDurationToSeconds = (duration: string | undefined): number => {
        if (!duration) return 0;

        const parts = duration.split(':').map(part => parseInt(part, 10));
        if (parts.length !== 3) return 0;

        const hours = parts[0] * 3600;
        const minutes = parts[1] * 60;
        const seconds = parts[2];

        return hours + minutes + seconds;
    };
    const totalDurationInSeconds = useMemo(() => {
        return convertDurationToSeconds(duration);
    }, [duration]);


    const handleSeek = (seconds: any) => {
        if (firstTime) {
            if (!toastDisplayed && videoRef?.current?.getCurrentTime() > currentTime) {
                toast.error('You cannot seek the video for the first time', {
                    position: 'bottom-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'colored',
                    onClose: () => setToastDisplayed(false),
                });
                setToastDisplayed(true);
            }
            if (videoRef?.current?.getCurrentTime() > currentTime) {
                videoRef.current.seekTo(currentTime)
            }
            else if (videoRef?.current?.getCurrentTime() === null) {
                videoRef.current.seekTo(currentTime)
            }

            setCurrentTime(seconds)
            return currentTime;
        }
        return seconds;
    };
    
    const handleProgress = (seconds: any) => {
        const { playedSeconds } = seconds?.playedSeconds;
        if (firstTime) {
            if (currentTime <= 0) {
                seconds.loadedSeconds = 0;
                return currentTime;
            }
            if (videoRef?.current?.getCurrentTime() > currentTime) {
                setCurrentTime(videoRef?.current?.getCurrentTime())
            }
        }
        const percentagePlayed = (playedSeconds / totalDurationInSeconds) * 100;
        if (!scoreSent[80] && percentagePlayed >= 80 && percentagePlayed < 100) {
            sendLog();
            setScoreSent(prevState => ({ ...prevState, 80: true }));
        }

        return playedSeconds;
    };

    const sendScore = (score: number) => {
        let dataObj = {
            new_score: score,
            batch_name: batchName
        };
        axiosHttp.post(ApiConstants.problems.markVideoWatched(id), dataObj).then((res) => {
            setToastDisplayed(true);
        });
    };

    const sendLog = () => {
        axiosHttp.post(ApiConstants.problems.logVideo(batchName)).then((res) => {
            setToastDisplayed(true);
        });
    };

    const handleEnded = () => {
        sendScore(10);
    };

    const handlePlay = () => {
        sessionStorage.setItem("videoPlaying", "true");
    };

    const handlePause = () => {
        sessionStorage.setItem("videoPlaying", "false");
    };

    return (
        <div className="parent-container px-2" style={{zIndex:1}}>
            <ReactPlayer
                ref={videoRef}
                url={link}
                controls
                width='100%'
                height='38.25vw'
                onProgress={handleProgress}
                onSeek={handleSeek}
                onEnded={handleEnded}
                onPlay={handlePlay}
                onPause={handlePause}
            />
            <ToastContainer />
        </div>
    );
}

export default VideoPlayer;
