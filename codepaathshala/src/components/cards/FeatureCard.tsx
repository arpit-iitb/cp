import {FeatureCardInterface} from "../../_utils/interface";
import {Card, CardContent} from "@mui/material";

export default function FeatureCard(props: FeatureCardInterface) {
    return <>
        <Card variant={'elevation'} className="!rounded-2xl !shadow-2xl">
            <CardContent>
                <div className="py-10">
                    <div className="mb-6">
                     <span className="p-4 bg-primary-500 rounded-2xl text-white">
                         {props.icon}
                     </span>
                    </div>
                    <h4 className="text-xl font-bold mb-3">{props.heading}</h4>
                    <p>{props.description}</p>
                </div>
            </CardContent>
        </Card>
    </>
}