import { observable, action } from 'mobx';

import agent from '../agent';
import commonStore from './CommonStore';

class AuthStore {
  @observable inProgress = false;

  @observable errors = undefined;

  @observable currentUser;

  @observable loadingUser;

  @observable showUserDialog = false;

  @action toggleUserDialog() {
    this.showUserDialog = !this.showUserDialog;
  }

  @action login({username, password}) {
    this.inProgress = true;
    this.errors = undefined;
    return agent.Auth.login(username, password)
      .then(({ authToken }) => {
        commonStore.setToken(authToken);
        // TODO until other stores refactored
        window.API.defaults.headers.common.Authorization = `Token ${authToken}`; // eslint-disable-line no-undef
      })
      .then(() => this.pullUser())
      .catch(
        action(err => {
          // This is a bit hardcoded but we know the API
          this.errors =
            err.response && err.response.body && err.response.body.nonFieldErrors && err.response.body.nonFieldErrors[0];
          throw err;
        })
      )
      .finally(
        action(() => {
          this.inProgress = false;
        })
      );
  }

  @action loginYeti(provider, accessToken) {
    this.inProgress = true;
    this.errors = undefined;
    return agent.Auth.loginYeti(provider, accessToken)
      .then(({ authToken }) => {
        commonStore.setToken(authToken);
        // TODO until other stores refactored
        window.API.defaults.headers.common.Authorization = `Token ${authToken}`; // eslint-disable-line no-undef
      })
      .then(() => this.pullUser())
      .catch(
        action(err => {
          this.errors =
            err.response && err.response.body && err.response.body.errors;
          throw err;
        })
      )
      .finally(
        action(() => {
          this.inProgress = false;
        })
      );
  }

  @action register(email, address, location, dob, gender, password) {
    this.inProgress = true;
    this.errors = undefined;
    return agent.Auth.register(email, address, location, dob, gender, password)
      .then(user => commonStore.setToken(user.authToken))
      .then(
        action(user => {
          this.currentUser = user;
        })
      )
      .catch(
        action(err => {
          this.errors =
            err.response && err.response.body && err.response.body.errors;
          throw err;
        })
      )
      .finally(
        action(() => {
          this.inProgress = false;
        })
      );
  }

  @action logout() {
    commonStore.setToken(undefined);
    // TODO until other stores refactored;
    window.API.defaults.headers.common.Authorization = undefined; // eslint-disable-line no-undef
    this.forgetUser();
    return Promise.resolve();
  }

  @action pullUser() {
    this.loadingUser = true;
    return agent.Auth.current()
      .then(
        action(user => {
          this.currentUser = user;
        })
      )
      .finally(
        action(() => {
          this.loadingUser = false;
        })
      );
  }

  @action forgetUser() {
    this.currentUser = undefined;
  }
}

export default new AuthStore();

