import React, { Component } from 'react';
import { observer, inject } from "mobx-react";
import PostLoginRedirect from '../PostLoginRedirect';

@inject("UserStore")
@observer
class AuthTokenComponent extends Component {

  render() {
    const { history, match, UserStore } = this.props;

    let authtoken = match.params.authtoken;

    UserStore.setupAuthToken(authtoken)
      .then((response) => {
        return <PostLoginRedirect />
      }).catch((error) => {
        console.log(error);
        // props.history.push('/login/' + match.params.redirect);
        // TODO store redirect in state properly here - @jimbofreedman
      });
  }
}


export default AuthTokenComponent;
