import Typewriter from "typewriter-effect";
import {TypeWriter} from "../_utils/interface";

export default function Type(props: TypeWriter) {
    return (
        <Typewriter
            component={props?.component??'span'}
            options={props.options}
        />
    );
}