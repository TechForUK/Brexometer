import React, { Component } from 'react';
import { observer, inject } from "mobx-react";
import { Redirect } from 'react-router-dom'

@inject("UserStore", "routing")
@observer
export default class Logout extends Component {
  componentDidMount() {
    const { UserStore } = this.props;
    UserStore.logout();
  }

  render() {
    // Todo show a message telling the user they are logged out
    return <Redirect to="/" />;
  }
}
