import { combineReducers } from 'redux';
import {problemListReducer} from "./problemList";

export const combinedReducers = combineReducers({
    problemList: problemListReducer,
});

export type State = ReturnType<typeof combinedReducers>;