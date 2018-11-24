import React, { Component } from 'react';
import { observer, inject } from "mobx-react";
import { Redirect } from 'react-router-dom';

@observer
class PostLoginRedirect extends Component {
  render() {
    const { location } = this.props;
    return <Redirect to={location.state && location.state.from ? location.state.from : "/"}/>;
  }
}

export default PostLoginRedirect;
