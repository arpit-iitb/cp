import {useState} from "react";
import {Card, CardActionArea, CardContent} from "@mui/material";
import VideoCard from "components/cards/VideoCard";
import "./Tabs.css";

const videoUrls = [
    "https://codingjudgeappimagesstatic.s3.ap-south-1.amazonaws.com/static-files/video2.mp4",
    "https://codingjudgeappimagesstatic.s3.ap-south-1.amazonaws.com/static-files/video1.mp4",
    "https://codingjudgeappimagesstatic.s3.ap-south-1.amazonaws.com/static-files/video3.mp4",
    "https://codingjudgeappimagesstatic.s3.ap-south-1.amazonaws.com/static-files/video4.mp4"
]

export default function TabContent() {
    const[value, setValue] = useState(0);
    const[videoUrl, setVideoUrl] = useState(videoUrls[0]);
    function handleChange(value:number) {
        setValue(value);
        setVideoUrl(videoUrls[value]);
    }

    return<>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            <div className="col-span-2">
                <div className="grid grid-cols-1 gap-3 tabs">
                    <Card className={`!rounded-xl !shadow-lg ${value === 0?'active':''}`}>
                        <CardActionArea onClick={()=>{handleChange(0)}}>
                            <CardContent>
                                <p className="text-xl mb-4">Questions Pool</p>
                                <p>Weekly segregation of the problems with topic and difficulty mapping</p>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                    <Card className={`!rounded-xl !shadow-lg ${value === 1?'active':''}`}>
                        <CardActionArea onClick={()=>{handleChange(1)}}>
                            <CardContent>
                                <p className="text-xl mb-4">Engagement Enhancers</p>
                                <p>Leaderboard and streak count to keep them engaged and consistent</p>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                    <Card className={`!rounded-xl !shadow-lg ${value === 2?'active':''}`}>
                        <CardActionArea onClick={()=>{handleChange(2)}}>
                            <CardContent>
                                <p className="text-xl mb-4">Compiler with Auto-Evaluation</p>
                                <p>Code, execute, evaluate! With support over 7+ languages and test cases</p>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                    <Card className={`!rounded-xl !shadow-lg ${value === 3?'active':''}`}>
                        <CardActionArea onClick={()=>{handleChange(3)}}>
                            <CardContent>
                                <p className="text-xl mb-4">Full-Stack Dev with live-preview</p>
                                <p>Full-Stack problems with live preview to enhance development skills</p>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </div>
            </div>
            <div className="col-span-3">
                <Card className="!rounded-xl !shadow-lg">
                    <CardContent>
                        <VideoCard autoplay={true} url={videoUrl}/>
                    </CardContent>
                </Card>
            </div>
        </div>
    </>;
}