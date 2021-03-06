import { call, put, takeEvery } from 'redux-saga/effects';
import { delay } from 'redux-saga'
import axios from 'axios';
import {setUser,loginSuccess, getArticlesForAllFeeds, addFeed, addFeedToCategory, setDisplayProgress} from './actions';

const createUserObj = (userObj, categoryList, feedList) => {
  const result = {};
  if(userObj.feeds) {
  userObj.feeds.forEach(function(feed) {
    if(!result[feed.categoryId]) {
      result[feed.categoryId] = {"categoryName": "", "feeds": []};
      for (let i = 0; i < categoryList.length; i++) {
        if (categoryList[i]._id === feed.categoryId) {
          result[feed.categoryId].categoryName = categoryList[i].name;
          break;
        }
      }
      for (let i = 0; i < feedList.length; i++) {
        if (feedList[i]._id === feed.feedId) {
          console.log('19 feedlist[i]', feedList[i])
          result[feed.categoryId].feeds.push({"name": feedList[i].name, "feedId": feed.feedId});
          break;
        }
      }
    }
    else {
      for (let i = 0; i < categoryList.length; i++) {
        if (categoryList[i]._id === feed.categoryId) {
          result[feed.categoryId].categoryName = categoryList[i].name;
          break;
        }
      }
      for (let i = 0; i < feedList.length; i++) {
        if (feedList[i]._id === feed.feedId) {
          result[feed.categoryId].feeds.push({"name": feedList[i].name, "feedId": feed.feedId});
          break;
        }
      }
    }
});

  }
  return result;
};

export function* findCreateUser(userId) {
  try {
    const userObj = yield call(axios.post, '/api/users/', userId);
    const categoryList = yield call(axios.get, '/api/categories');
    const feedList = yield call(axios.get, '/api/feeds/');
    const result = createUserObj(userObj.data.user, categoryList.data, feedList.data);
    yield put(setUser(result, categoryList.data, feedList.data));
    yield put(loginSuccess(JSON.parse(localStorage.getItem('profile'))));
  } catch (e) {
    console.log('Error: ', e);
  }
}

export function* getArticlesForAllFeedsFromdb() {
  try {
    const userId = JSON.parse(localStorage.getItem('profile')).identities[0].user_id;

    const userObj = yield call(axios.post, '/api/users/', {userId: userId});

    const responses  = yield userObj.data.user.feeds.map(feed => call(axios.post, '/api/articles', {feedId: feed.feedId}));

    const result = {};
    for(let i=0; i< responses.length; i++) {
      result[userObj.data.user.feeds[i].feedId] = responses[i].data;
    }
    yield put(getArticlesForAllFeeds(result));
    yield call(delay, 1000);
    yield put(setDisplayProgress(false));

  } catch (e) {

  }
}

export function* addFeedToDb(action) {
  try {
    const categoryId = action.categoryId;
    const response = yield call(axios.post, '/api/feeds', {url: action.url, userId: action.userId, categoryId: action.categoryId});
    yield call(getArticlesForAllFeedsFromdb);
    // const feedResponse = yield call(axios.get, '/api/feeds/' + response.data.id);
    // console.log('feedResponse: ', JSON.stringify(feedResponse.data));
    yield put(addFeedToCategory("Hello", response.data.id, categoryId));
  } catch (e) {
    console.log('Error: ', e);
  }
}

export function* deleteFeedsFromDb(actions) {
  try {
    const responses = yield actions.feeds.map((feed) => call(axios.delete, `/api/feeds/${feed}`));
    yield call(findCreateUser, {userId: actions.userId});
 } catch (e) {

 }
}

export default function *rootSaga() {
  yield takeEvery('FIND_OR_CREATE_USER', findCreateUser);
  yield takeEvery('FETCH_ARTICLES_FOR_FEEDS', getArticlesForAllFeedsFromdb);
  yield takeEvery('ADD_FEED', addFeedToDb);
  yield takeEvery('DELETE_FEEDS_FROM_DB', deleteFeedsFromDb)
}
