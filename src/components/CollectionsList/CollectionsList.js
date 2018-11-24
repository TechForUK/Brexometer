import React from 'react';
import { observer, inject } from "mobx-react";
import {Helmet} from "react-helmet";
import RaisedButton from 'material-ui/RaisedButton';
//import smallLogo from './represent_white_outline.svg';

import './CollectionsList.css';



@inject("CollectionStore", "UserStore")
@observer
class CollectionsList extends React.Component {
  render() {
    const { history, UserStore, CollectionStore } = this.props;

    if (CollectionStore.collections.size <= 0) {
      return null;
    }

    return (
      <div>


        {!UserStore.isLoggedIn() && <div className="aboutus clear">

          <h2><strong> Represent believes a more effective democracy is within reach </strong></h2>

          <div className="aboutus_right">

            <img src="https://i1.wp.com/represent.me/wp-content/uploads/results.gif" alt="chatbot"/>

          </div>

          <div className="aboutus_left">


            <p><strong>
              Represent gives your views and values a voice.
            </strong>
            </p>
            <p>
              One central place to vote on the issues and work with the politicians and groups you trust to represent
              you.
            </p>
            <p>
              Represent is free, open to everyone, anonymous and secure.

              We are your trusted partner, making our combined voices more powerful and effective
              to create the world we want.
            </p>


            <div>
              <RaisedButton label="Sign Up" onClick={() => history.push('login')} style={{ marginRight: 10 }}/>
              <RaisedButton label="Features" primary={true} href="https://represent.me/features/" target="_blank"/>
            </div>

          </div>
        </div>}

        <div>
          <div className="imageContainer"
               style={{
                 background: 'url(/img/montage.jpg)',
                 padding: '70px 0 90px 0'
               }}>
            <div className="contentBox">

              <h1 style={{ maxWidth: '600px', display: '-webkit-inline-box' }}>
                What kind of Brexit would suit me best?
              </h1>

              <p>
                Take a short quiz to find out whether your views on Brexit
                match up with your opinions on various issues the country faces,
                and also how your views match with various well-known MPs.
              </p>

              <p>
                You may be surprised by the results!
              </p>

              <RaisedButton
                label="Start"
                primary
                href="/survey/146/flow/0/vote/"
                style={{ marginTop: 15 }}
              />

            </div>
          </div>

        </div>
        <OgTags />
      </div>
    );
  }
}

const OgTags = () => {
  const og = {
    url: window.location.origin,
    title: "Let's build a better democracy",
    image: 'http://i.imgur.com/wrW7xwp.png',
    desc: "Have your say!"


  }
  return (<Helmet>
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@representlive" />
    <meta name="twitter:creator" content="@representlive" />
    <meta name="twitter:title" content={og.title} />
    <meta name="twitter:description" content={og.desc} />
    <meta name="twitter:image" content={og.image} />

    <meta property="og:url" content={og.url} />
    <meta property="og:title" content={og.title} />
    <meta property="og:image" content={og.image} />
    <meta property="og:type" content="website" />
    <meta property="fb:app_id" content="1499361770335561" />
    <meta property="og:description" content={og.desc} />
  </Helmet>)
}

export default CollectionsList;
