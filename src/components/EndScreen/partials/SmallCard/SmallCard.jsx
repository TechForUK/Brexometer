import React, { Component } from 'react'
import { observer } from "mobx-react";
import {Card, CardActions, CardTitle, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';


@observer
class SmallCard extends Component {

	render(){
  	return (
      <div>
        {!this.props.data && <p></p>}
        {this.props.data.values &&
          <div style={{minHeight: 500}}>
            <Card style={{minHeight: 300}}>
         {/*      <div style={{display: 'flex', flexFlow: 'row nowrap', justifyContent: 'spaceBetween'}}>
                <div style={{flex: 1, margin: 15,  width: 200, height: 250, border: '2px solid black'}}>
                  <div style={{flex: 1, borderBottom: '2px solid grey', color: 'white', padding: 10, fontWeight: 'bold', backgroundColor: this.props.data.values[0].fill, minHeight: 70}}>
                    <p style={{color: 'white', fontSize: 20, textAlign: 'left'}}>Agree with you</p>
                    <p style={{color: 'white', fontSize: 35, textAlign: 'left'}}>{`${this.props.data.values[0].percentage}%`}</p>
                  </div>
                <div style={{flex: 1, height: 50, borderBottom: '1px solid grey, fontSize: 14'}}>
                  <p>{this.props.data.values[0].title}</p>
                </div>
                <div style={{flex: 1, height: 50, borderBottom: '1px solid grey, fontSize: 14'}}>
                  <p> Details [buttons]</p>
                </div>
                </div>
            </div>
          */}




    <CardTitle title="47%" subtitle="Agree with you" style={{backgroundColor: this.props.data.values[0].fill, color: 'white'}} />
    <CardText style={{fontSize: '20px', fontWeight: '200'}}>
      {this.props.data.values[0].title}
    </CardText>
    <Divider />
    <CardActions>
      <FlatButton label="Details" /> 
    </CardActions>
   
          </Card>
        </div>}
      </div>
    )
  }
}

export default SmallCard