export const SET_NEWS_ACTION = 'SET_NEWS';
export const SET_SELECTED_SINGLE_NEWS_ACTION = 'SET_SELECTED_SINGLE_NEWS';

export const setNewsAction = (news) => ({
    type: SET_NEWS_ACTION,
    payload: news
});

export const setSelectedSingleNewsAction = (singleNews) => ({
    type: SET_SELECTED_SINGLE_NEWS_ACTION,
    payload: singleNews
});

