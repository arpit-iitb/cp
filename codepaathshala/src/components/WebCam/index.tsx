import { useEffect, useState } from 'react';
import { CameraOptions, useFaceDetection } from 'react-use-face-detection';
import * as FaceDetection from '@mediapipe/face_detection';
import Webcam from 'react-webcam';
import * as CameraUtils from '@mediapipe/camera_utils';
import { FaceDetectionEnum } from "../../_utils/enum";

function WebCamComponent({ width, height, faceDetected, showBorder = true, inAssessment = false, faceDetectionError }: {
    width: number,
    height: number,
    faceDetected: (value: boolean) => void,
    showBorder?: boolean,
    inAssessment?: boolean,
    faceDetectionError?: (data: { errorType: FaceDetectionEnum, message: string }) => void
}) {
    const [webcamAccessed, setWebcamAccessed] = useState(false);

    const videoConstraints = {
        width: width,
        height: height,
        facingMode: 'user',
    };
    const { webcamRef, boundingBox, isLoading, detected, facesDetected } = useFaceDetection({
        faceDetectionOptions: {
            model: 'short',
        },
        faceDetection: new FaceDetection.FaceDetection({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
        }),
        camera: ({ mediaSrc, onFrame }: CameraOptions) =>
            new CameraUtils.Camera(mediaSrc, {
                onFrame,
                width,
                height
            }),
    });

    useEffect(() => {
        const checkWebcamAccess = async () => {
            try {
                await navigator?.mediaDevices?.getUserMedia({ video: true });
                setWebcamAccessed(true);
            } catch (error) {
                await navigator?.permissions?.query({ name: 'camera' } as any);
                setWebcamAccessed(false);
                faceDetected(false);

            }
        };

        checkWebcamAccess();

        return () => {
        };
    }, [faceDetected]);

    useEffect(() => {
        if (!isLoading && inAssessment) {
            if ((facesDetected === 0 || !detected) && !isLoading && faceDetectionError) {
                faceDetectionError({
                    errorType: FaceDetectionEnum.NO_FACE,
                    message: "No Face Detected"
                })
                showToastOnce("No Face Detected")
            } else if (facesDetected > 1 && !isLoading && faceDetectionError) {

                faceDetectionError({
                    errorType: FaceDetectionEnum.MULTIPLE_FACES,
                    message: "More than 1 face detected"
                })
                showToastOnce("More than 1 face detected")
            }
        }
        faceDetected(detected);
    }, [facesDetected, detected, isLoading, faceDetected, faceDetectionError, inAssessment]);

    useEffect(() => {
    }, [webcamAccessed, isLoading, facesDetected, detected, boundingBox]);

    const showToastOnce = (message: string) => {
        // toast.warn(message, {
        //     position: 'bottom-right',
        //     autoClose: 3000,
        //     hideProgressBar: false,
        //     closeOnClick: true,
        //     pauseOnHover: true,
        //     draggable: true,
        //     progress: undefined,
        //     theme: 'colored',
        //     containerId: 'toastId',
        // });
    };
    return (
        <div>
            {/* <ToastContainer containerId={"toastId"} /> */}
            <div style={{ width, position: 'relative', height }}>
                {boundingBox.map((box, index) => (
                    showBorder ? <div
                        key={`${index + 1}`}
                        style={{
                            border: '1px solid red',
                            position: 'absolute',
                            top: `${box.yCenter * 100}%`,
                            left: `${box.xCenter * 100}%`,
                            width: `${box.width * 100}%`,
                            height: `${box.height * 100}%`,
                            zIndex: 1,
                        }}
                    /> : null
                ))}
                <Webcam
                    className="h-full absolute top-0 left-0 rounded rounded-xl"
                    ref={webcamRef}
                    mirrored={false}
                    width={width}
                    height={height}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    forceScreenshotSourceSize
                />
            </div>
        </div>
    );
}

export default WebCamComponent;