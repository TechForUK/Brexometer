import React from 'react';
import { observer, inject } from "mobx-react";
import PostLoginRedirect from '../PostLoginRedirect';

@inject("UserStore")
@observer
class AuthCode extends React.Component {
  render() {
    const { UserStore, match } = this.props;

    let code = match.params.code;
    let email = match.params.email;

    window.API.post("/auth/onetime_signin/", {
      code,
      email,
    }).then((response) => {
      if (response.data.access_token) {
        UserStore.setupAuthToken(response.data.access_token);
        return <PostLoginRedirect/>
      } else {
        return <PostLoginRedirect/>
      }
    }).catch((error) => {
      return <PostLoginRedirect/>
    });

    return (
      <p>Logging in...</p>
    );
  }
};

export default AuthCode;
