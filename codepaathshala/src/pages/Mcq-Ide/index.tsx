import { ApiConstants } from "_utils/api-constants";
import axiosHttp from "_utils/axios.index";
import { AxiosResponse } from "axios";
import McqIde from "components/MCQ-ide/mcq-ide";
import SEO from "components/SEO";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function McqIndex() {
    const { batch, id } = useParams();
    const [questions, setQuestions] = useState([])
    const [canSolve, setcanSolve] = useState(true)
    const [weekNum, setWeekNum] = useState()
    const [title, setTitle] = useState()
    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        getData();
    }, [batch, id]);

    function getData() {
        axiosHttp.get(ApiConstants.problems.mcqassignment(batch, id))
            .then((res: AxiosResponse) => {
                if (!res?.data.title) {
                    document.title = "Practice MCQ Assessment|CodePaathshala"
                }
                else {
                    document.title = `${res?.data.title}`

                }
                setQuestions(res.data.questions)
                setTitle(res.data.title)
                setcanSolve(res.data?.can_solve ?? true)
                setWeekNum(res.data?.week_number)
            })
    }

    return <>
        <SEO title={'MCQ-Assessment | CodePaathshala'} description={'Problems'} />

        {questions && <McqIde quizData={questions} id={id} batch={batch} canSolve={canSolve} weekNum={weekNum} title={title} />}
    </>

}
export default McqIndex;