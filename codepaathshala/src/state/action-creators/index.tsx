import { Dispatch } from 'redux';
import {ProblemDataInterface} from "../../_utils/interface";
import {ProblemListActionTypes} from "../action-types";
import {Action} from "../actions";
import {ProblemListPayloadInterface} from "../state-model";


const updateProblemList = (data: ProblemDataInterface) => {
    return (dispatch: Dispatch<Action>) => {
        dispatch({
            type: ProblemListActionTypes.UPDATE_LIST,
            payload: data
        })
    }
}

const getNextProblem = (data: ProblemListPayloadInterface) => {
    return (dispatch: Dispatch<Action>) => {
        dispatch({
            type: ProblemListActionTypes.GET_NEXT,
            payload: data
        })
    }
}

const getPrevProblem = (data: ProblemListPayloadInterface) => {
    return (dispatch: Dispatch<Action>) => {
        dispatch({
            type: ProblemListActionTypes.GET_PREV,
            payload: data
        })
    }
}

const setCurrentWeek = (data: number) => {
    return (dispatch: Dispatch<Action>) => {
        dispatch({
            type: ProblemListActionTypes.SET_CURRENT_WEEK,
            payload: data
        })
    }
}

export const ActionCreators = {updateProblemList, getNextProblem, getPrevProblem, setCurrentWeek};