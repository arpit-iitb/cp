import Slider, {CustomArrowProps, Settings} from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import "./carousel.css";

const defaultSettings: Settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: true,
    autoplay: false,
    adaptiveHeight: true,
    nextArrow: <RightIcon/>,
    prevArrow: <LeftIcon/>,
    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 3
            }
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 2
            }
        },
        {
            breakpoint: 480,
            settings: {
                slidesToShow: 1
            }
        }
    ]
};

export function RightIcon(props: CustomArrowProps) {
    return <button onClick={props.onClick} className="p-3 md:p-4 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full absolute top-[100%] md:top-[110%] start-[50%]"><ChevronRightIcon/></button>
}

export function LeftIcon(props: CustomArrowProps) {
    return <button onClick={props.onClick} className="p-3 md:p-4 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full absolute top-[100%] md:top-[110%] start-[42%]"><ChevronLeftIcon/></button>
}

export default function CJCarousel({children, settings}:{children:any, settings?: Settings}) {
    return<div className="wrapper">
        <Slider
            {...{...defaultSettings, ...settings}}
        >
            {children}
        </Slider>
    </div>
}