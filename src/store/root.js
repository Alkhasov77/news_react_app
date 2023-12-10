import { combineReducers, createStore } from "redux";
import { newsReducer } from "./news/reducers";

const rootReducer = combineReducers({
    news: newsReducer,
});

export const rootStore = createStore(rootReducer);
