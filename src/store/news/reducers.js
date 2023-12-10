import { SET_NEWS_ACTION, SET_SELECTED_SINGLE_NEWS_ACTION } from "./actions";

const initialState = {
    allNews: [],
    selectedSingleNews: null,
};

export const newsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_NEWS_ACTION:
      return {
        ...state,
        allNews: action.payload,
      };

    case SET_SELECTED_SINGLE_NEWS_ACTION:
      return {
        ...state,
        selectedSingleNews: action.payload,
      };

    default:
      return state;
  }
};
