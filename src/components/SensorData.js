
import React, {Component} from 'react';
import FlatButton from 'material-ui/FlatButton';
import Subheader from 'material-ui/Subheader';

class SensorData extends Component {
  getRow = (rowData) => {
    var returnValue = [];
    for(var i in rowData){
      if (i !== 'id' && i != 'type' && i != 'owner' && i != 'last_value' && i != "actions") {
        
        let val = (this.props.rowData[i] && typeof this.props.rowData[i].value != 'undefined' )? this.props.rowData[i].value : 0;
        returnValue.push(
           <li> {i + ": " + String(val)} </li>
        )
      }
    }
    return returnValue;
  }
  render() {
    return (
      <div>
        {
          this.getRow(this.props.rowData)
        }
        </div>
    );
  }
}

export default SensorData;

