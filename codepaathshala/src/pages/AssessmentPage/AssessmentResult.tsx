import { useLocation } from "react-router-dom";
import CongratulationIcon from "assets/svg/congrats.svg"
import { useEffect, useState } from "react";
export default function AssessmentResult() {
    // const location = useLocation();
    // console.info(location,6)
    useEffect(() => {
        const stopCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia();
                stream.getTracks().forEach(track => track.stop());


            } catch (error) {
                console.error('Error stopping camera:', error);
            }
        };

        stopCamera();

    }, []);


    return <>
        <div
            className="flex flex-col p-6 w-1/2 mx-auto justify-center items-center">
            <ul className="text-center">

                <li className="flex justify-center items-center"><img src={CongratulationIcon} alt="icon" /></li>
                <li className="text-3xl text-secondary-500">Test Submitted Successfully!!</li>
                {/* <li>Marks Obtained: <span
                                    className="font-bold text-xl text-green-800"> {showResults?.marks_obtained}<span className="!text-gray-900">/ {showResults?.total_marks}</span></span>
                                </li> */}
            </ul>
            {/* <button onClick={goToRegisterdBatches}
                                className="mt-4 bg-primary-500 hover:bg-primary-70 text-white  py-2 px-4 rounded">
                                Back to Course
                            </button> */}
        </div>
    </>
}