import React, { Component } from 'react';
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import { observer, inject } from "mobx-react";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Link } from 'react-router-dom';
import Tappable from 'react-tappable';

import Slider from 'material-ui/Slider';
import LinearProgress from 'material-ui/LinearProgress';
import { white, cyan600, grey300 } from 'material-ui/styles/colors';
import ReactMarkdown from 'react-markdown';
import Dialog from 'material-ui/Dialog';
import $ from 'jquery';
import DateOfBirth from "../../../DateOfBirth";
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import GeoService from '../../../../services/GeoService';

const customContentStyle = {
  width: '97vw',
  height: '98vh',
  maxWidth: '600px',
  padding: '10px !Important',
  
};


export default @observer @inject("UserStore") class MoreUserInfo extends Component {

  constructor() {
    super();

    this.state = {
      ddDOB: null,
      ddGender: null,
      txtPostcode: "",
      checkedPostcode: false,
      step: 0,
      problems: [],
      shown: false
    }
  }

  componentWillUpdate(nextProps){
    if (this.state.shown != nextProps.shown && nextProps.user){
      console.log(nextProps)
      this.setState({ ddDOB: nextProps.user.dob, ddGender: nextProps.user.gender, txtPostcode: nextProps.user.address, shown: true})
    }
  }

  getLocation = () => {
    this.setState({ checkedPostcode: false }, () => {

      if (this.state.txtPostcode.length < 3) {
        return false;
      }

      GeoService.checkPostcode(this.state.txtPostcode)
        .then(function (response) {
          if (response.data.status === "OK" && response.data.results[0].geometry.location) {
            this.setState({ checkedPostcode: true, lat: response.data.results[0].geometry.location.lat, lng: response.data.results[0].geometry.location.lng });
          }
        }.bind(this));
    });
  }

  updateField = (field, newValue) => {
    let newState = {};
    newState[field] = newValue;
    this.setState(newState, () => {
      // Check postcode in realtime
      if (field === "txtPostcode") {
        this.getLocation();
      }
    });
  }

  closeModal = () => {
    this.setState({shown:false})
  }

  updateDetails = () => {

    let problems = [];

    if (this.state.ddDOB === null) {
      problems.push("Please enter a valid date of birth!");
    }

    if (this.state.ddGender === null) {
      problems.push("Please select your gender, or choose 'I would rather not say'");
    }

    if (!this.state.checkedPostcode && (this.state.txtPostcode.length < 2 || this.state.txtPostcode.length > 8)) {
      problems.push("Please enter a valid postcode!");
    }

    if (problems.length !== 0) {
      this.setState({ problems });
      return;
    }

    let googleLocation = {
      "type": "Point",
      "coordinates": [this.state.lng, this.state.lat],
    };

    window.API.patch("/auth/me/", {
      dob: this.state.ddDOB.substring(0, 10),
      gender: this.state.ddGender,
      address: (this.state.checkedPostcode ? this.state.txtPostcode : undefined),
      location: (this.state.checkedPostcode ? googleLocation : undefined),
    }).then((response) => {
      this.setState({ shown: false })
    }).catch((error) => {
      this.setState({ problems: [JSON.stringify(error.response.data)] })
    });
  }

  render() {
    return (
      <Dialog
        open={this.state.shown}
        onRequestClose={this.closeModal}
        modal={false}
        contentStyle={customContentStyle}
        autoScrollBodyContent={true}>

        <p style={{ margin: 0}}><strong>Please verify your profile.</strong><br/> <em>Your personal information safe and not for sale.</em></p>

        <TextField
          floatingLabelText="Postcode"
          style={{ width: '100%' }}
          floatingLabelFocusStyle={{ color: cyan600 }}
          defaultValue={this.state.txtPostcode}
          onChange={(e, newValue) => this.updateField('txtPostcode', newValue)}
        />

        <DateOfBirth onChange={(newValue) => this.updateField('ddDOB', newValue)} value={this.state.ddDOB} />

          <SelectField
            floatingLabelText="Gender"
            value={this.state.ddGender}
            style={{ width: '100%' }}
            onChange={(e, newIndex, newValue) => this.updateField('ddGender', newValue)}
          >
            <MenuItem value={1} primaryText="Male" />
            <MenuItem value={2} primaryText="Female" />
            <MenuItem value={3} primaryText="Rather not say" />
          </SelectField>

        {this.state.problems.map((problem, index) => {
          return (
            <p key={index} style={{color: 'red', margin: '0', marginBottom: '5px', fontSize: '14px'}}>{problem}</p>
          );
        })}

        <div>
          <FlatButton label="Skip" onClick={this.closeModal} style={{marginRight: '10px', color: '#999'}}/>
          <FlatButton label="Continue" primary={true} onClick={this.updateDetails} />
        </div>
      </Dialog>
    )
  }

}
