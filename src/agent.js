import superagentPromise from 'superagent-promise';
import _superagent from 'superagent';
import caseConverter from 'superagent-case-converter'
import commonStore from './stores/CommonStore';
const superagent = superagentPromise(_superagent, global.Promise);

const API_ROOT = 'http://api.represent.me';

const handleErrors = err => {
  if (err && err.response && err.response.status === 401) {
    authStore.logout();
  }
  return err;
};
const responseBody = res => res.body;
const tokenPlugin = req => {
  if (commonStore.token) {
    req.set('authorization', `Token ${commonStore.token}`);
  }
};

const requests = {
  del: url =>
    superagent
      .del(`${API_ROOT}${url}`)
      .use(caseConverter)
      .use(tokenPlugin)
      .end(handleErrors)
      .then(responseBody),
  get: url =>
    superagent
      .get(`${API_ROOT}${url}`)
      .use(caseConverter)
      .use(tokenPlugin)
      .end(handleErrors)
      .then(responseBody),
  put: (url, body) =>
    superagent
      .put(`${API_ROOT}${url}`, body)
      .use(caseConverter)
      .use(tokenPlugin)
      .end(handleErrors)
      .then(responseBody),
  post: (url, body) =>
    superagent
      .post(`${API_ROOT}${url}`, body)
      .use(caseConverter)
      .use(tokenPlugin)
      .end(handleErrors)
      .then(responseBody),
};

const Auth = {
  current: () =>
    requests.get('/auth/me/'),
  login: (username, password) =>
    requests.post('/auth/login/', { username, password }),
  loginYeti: (provider, accessToken) =>
    requests.post('/auth-yeti/', { provider, accessToken }),
  register: (email, address, location, dob, gender, password) =>
    requests.post('/auth/register/', {
      username: email,
      email,
      address,
      location,
      dob,
      gender,
      password,
      firstName: '',
      lastName: ''
    }),
};

export default {
  Auth
};
