import {Action} from '../actions';
import {ProblemListActionTypes} from '../action-types';
import {ProblemDataInterface, ProblemStateInterface} from "../../_utils/interface";

const initialState: ProblemStateInterface = {
    problemList: {} as ProblemDataInterface,
    currentWeek: 1
};

export const problemListReducer = (state = initialState, action: Action) => {
    switch (action.type) {
        case ProblemListActionTypes.GET_NEXT:
            break;
        case ProblemListActionTypes.GET_PREV:
            break;
        case ProblemListActionTypes.UPDATE_LIST:
            state.problemList = action.payload;
            return state;
        case ProblemListActionTypes.SET_CURRENT_WEEK:
            state.currentWeek = action.payload;
            return state;
        default:
            return state;
    }
}