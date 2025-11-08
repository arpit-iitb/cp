import { Card, CardContent, Tooltip } from "@mui/material";
import { AdminCardDataInterface } from "_utils/interface";
import InfoIcon from '@mui/icons-material/Info';
export default function DataCard(props: AdminCardDataInterface) {
    return (
        <Card variant="outlined" className="!rounded-xl border-1 !border-primary-100 !shadow-none">
            <CardContent className="h-full">
                <div className="flex justify-between">
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-3xl font-bold text-secondary-500">{props.data}</h3>
                        </div>
                        <div className="text-indigo-900 opacity-60 text-base">
                            {props.title} 
                            <span className="text-xs  ml-2">
                                <Tooltip title={props.tooltip}> 
                                    <InfoIcon sx={{ fontSize: "medium" }}  className="-mt-1"/>
                                </Tooltip>
                                </span>
                        </div>
                    </div>
                    <div className="flex items-center justify-center bg-primary-100 rounded-full w-16 h-16">
                        {props.icon ? (
                            <img src={props.icon} alt="icon" className="w-8 h-8" />
                        ) : (
                            <span className="text-lg"></span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}