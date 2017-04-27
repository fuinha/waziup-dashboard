import axios from 'axios'
import React, { Component } from 'react';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import { Container,  Col, Visible, Hidden } from 'react-grid-system'
import {List, ListItem} from 'material-ui/List';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import UTIL from '../../../utils.js'
import { LineChart, Line,CartesianGrid, XAxis, YAxis, Tooltip} from 'recharts';

var position = [12.238, -1.561];
class sensorDetail extends Component {
     constructor(props){
        super(props);
        this.state = {
            sensor: {},
            dateModified: "not available",
            dateCreated: "not available",
            servicePath: "not available",
            markers: [],
            id:this.props.params.sensorId,
            historicalData: [],
        };
      }
 
  defaultProps = {
    sensors: []
  };

  componentWillReceiveProps(nextProps){
    if (nextProps.sensors && this.props.params.sensorId) {
        var sensor = nextProps.sensors.find((el)=>{
            return el.id === this.props.params.sensorId;
        });
        this.setState({sensor:sensor});
        
        if(sensor.dateModified && sensor.dateModified.value) {
           this.setState({dateModified:sensor.dateModified.value});
        }
        if(sensor.dateCreated && sensor.dateCreated.value) {
           this.setState({dateCreated:sensor.dateCreated.value});
        }
        if(sensor.servicePath && sensor.servicePath.value) {
           this.setState({servicePath:sensor.servicePath.value});
        }

        var markers = [];
        if(sensor.location && sensor.location.coordinates){
            markers.push({
              position:[
                sensor.location.coordinates[1],
                sensor.location.coordinates[0]
              ],
              defaultAnimation: 2,
            });
          }
        position = markers[0].position;
        this.setState({markers:markers})

    }

    console.log('in propos sensor: ' + JSON.stringify(this.state.sensor));

  }

 componentWillMount() {
   //console.log('SSSSSSSSSSss:' + this.state.servicePath + " ---" + this.props.params.sensorId);
      //var url='http://historicaldata.waziup.io/STH/v1/contextEntities/type/SensingDevice/id/' + this.props.params.sensorId + '/attributes/temperature';
      var url='http://historicaldata.waziup.io/STH/v1/contextEntities/type/SensingDevice/id/Device_6/attributes/temperature';
      axios.get(url, {
        params: {'lastN': '10'},
        headers: {
        'Fiware-ServicePath': '/FL',
        'Fiware-Service':"waziup",
        "Accept": "application/json"
        }})
        .then((response)  => {
          var contextResponse0 = response.data.contextResponses[0];
          const {contextElement: contextElement} = contextResponse0;
          const attribute0 = contextElement.attributes[0];
          const values = attribute0.values;
          console.log("Temperature:" + attribute0.name);

          var data = [];
        
          for (var i in values) {
              var value = values[i];
              console.log(value.attrValue + "  ,  " + value.recvTime);
              data.push({time: value.recvTime.toString().substring(11, 19), value:parseFloat(value.attrValue)});
          }
          this.setState({historicalData: (data.length > 0 ? [data] : [])});       
      })
      .catch((response) => {
          console.log("ERROR");
          console.log(response);
          return;
      })
  }
  
  render() {
    var visComp = <CardText> Data is not available. </CardText>
    if(this.state.historicalData.length > 0) {
        console.log("tehre are some data");
          visComp = <CardText>
                <LineChart width={1200} height={1000} data={this.state.historicalData[0]} margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
                <Line type="monotone" fill="#8884d8" dataKey="value" stroke="#8884d8" dot={{ stroke: 'red', strokeWidth: 5 }} activeDot={{ stroke: 'yellow', strokeWidth: 8, r: 10 }} label={{ fill: 'red', fontSize: 20 }} name="Temperature" />
                <CartesianGrid  stroke="#ccc" strokeDasharray="3 3"/>
                <XAxis dataKey="time"  padding={{ left: 20, right: 20 }}  label="Time" name="Date"/>
                <YAxis   />            
                <Tooltip />
                </LineChart>
            </CardText>
    } 
      
    

    if (this.state.markers.lenght>0) {
    }
    const listMarkers = this.state.markers.map((marker,index) =>
            <Marker key={index} position={marker.position}>
              <Popup>
                <span>Sensor infos<br/>{marker.position}</span>
              </Popup>
            </Marker>
    ); 
    return (
      <div className="sensor">
        <h1 className="page-title">Sensor: {this.state.id}</h1>
        <Container fluid={true}>
           <Card>
            <CardTitle title="Sensor location"/>
            <CardMedia>
              <Map ref="map" center={position} zoom={8}>
                <TileLayer
                  url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                {listMarkers}
              </Map>
            </CardMedia>

            <CardTitle title="Current values"/>
            <CardText>
              <List>
                {UTIL.getMeasurements(this.state.sensor).map((itemID) => {
                  return (
                    <ListItem primaryText={itemID.key + ": " + itemID.value} />
                  )
                })}
                <ListItem primaryText={"Date created: " + this.state.dateCreated} />
                <ListItem primaryText={"Date modified: " + this.state.dateModified} />
                <ListItem primaryText={"Service path: " + this.state.servicePath} />

                
              </List>

            </CardText>
            
            <CardTitle title="Historical Data"/>
              {visComp}
          </Card>
        </Container>
      </div>
    );
  }
}

export default sensorDetail;