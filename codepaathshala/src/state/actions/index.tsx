import {ProblemListActionTypes} from "../action-types";
import {ProblemDataInterface} from "../../_utils/interface";
import {ProblemListPayloadInterface} from "../state-model";

type UpdateProblemListAction = {
    type: ProblemListActionTypes.UPDATE_LIST;
    payload: ProblemDataInterface
}

type GetNextProblemAction = {
    type: ProblemListActionTypes.GET_NEXT;
    payload: ProblemListPayloadInterface
}

type GetPrevProblemAction = {
    type: ProblemListActionTypes.GET_PREV;
    payload: ProblemListPayloadInterface
}

type SetCurrentWeekAction = {
    type: ProblemListActionTypes.SET_CURRENT_WEEK;
    payload: number
}

export type Action = UpdateProblemListAction | GetNextProblemAction | GetPrevProblemAction | SetCurrentWeekAction;