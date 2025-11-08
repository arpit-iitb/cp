import ReactPlayer from "react-player/lazy";

export default function VideoCard({url, className, autoplay}: {url:string, className?:string, autoplay?:boolean}) {
    return<div className={className}>
        <ReactPlayer playing={autoplay??false} width={'100%'} height={'100%'} url={url} controls={true} />
    </div>
}