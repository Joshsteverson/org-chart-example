import React, { Component } from 'react';
import './App.css';

import seatHolders from './data/seatholders.json';
import seats from './data/seats.json';
import users from './data/users.json';
import objectPath from 'simple-object-path';
import 'react-orgchart/index.css';
import OrgChart from 'react-orgchart';

import { Table } from 'react-bootstrap';

const OrgChartNode = ({node}) => {
  return (
    <div className="initechNode" key={node.key}>
      <Table>
        <tbody>
          <tr>
            <th>{ node.seatName }</th>
          </tr>
          {
            node.users && node.users.map(user => {
              return (
                <tr key={user.key}>
                <td>
                  {user.name}
                  {user.picture && <img alt="avatar" className="avatar" src={user.picture}/>}
                  {!user.picture &&  <img alt="avatar" className="avatar" src="https://ind.proz.com/zf/images/default_user_512px.png"/>}
                </td>
                </tr>
              )
            })
          }
        </tbody>
      </Table>
    
    </div>
  );
};
class App extends Component {
  constructor() {
    super();
    this.state = {};
    this.updateOrgChart = this.updateOrgChart.bind(this);
    this.obtainSeatHierarchy = this.obtainSeatHierarchy.bind(this);
  }
  updateOrgChart(e) {
    const activeParentSeatId = e.target.value; 
    this.setState({activeParentSeatId})
  }

  obtainSeatHierarchy(activeParentSeatId) {
    const output = {};
    const recurse = (parentSeatId, obj) => {
      const parentSeat = seats.find(s => s._id === parentSeatId);
      const foundSeatHolders = seatHolders.filter(s => s.seatId === parentSeat._id);
      const foundSeatHolderUserIds = foundSeatHolders.map(f => f.userId);
      const seatHolderUsers = users.filter(u => foundSeatHolderUserIds.includes(u._id));
      obj.seatName = parentSeat.name;
      obj.key = parentSeatId;
      obj.users = seatHolderUsers.map(seatHolder => {
        const firstName = objectPath(seatHolder, 'metadata/name/first');
        const lastName = objectPath(seatHolder, 'metadata/name/last');
        const picture = objectPath(seatHolder, 'metadata/picture/url');
        return {
          key: seatHolder._id,
          name: `${firstName} ${lastName}`,
          picture
        }
      });
      if(seatHolderUsers.length === 0) {
        obj.users = [
          {
            key: Math.random(),
            name: 'No Seat Holders'
          }
        ]
      }

      const { _id: foundParentSeatId } = parentSeat;
      const childSeats = seats.filter(s => s.parentSeatId === foundParentSeatId);
      obj.children = childSeats.sort((a, b) => parseInt(a.ordinal, 10) > parseInt(b.ordinal, 10)).map(child => {
        const newChild = {
          seatName: child.name
        };
        recurse(child._id, newChild);
        return newChild;
      });
    };
    recurse(activeParentSeatId, output)
    return output
  }

  render() {
    const { activeParentSeatId } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <select onChange={this.updateOrgChart}>
            <option>Please select seat</option>
            {
              seats.map(s => <option key={s._id} value={s._id}>{s.name}</option>)
            }
          </select>
        </header>
        <div className="App-intro">
          <div id="initechOrgChart">
           {activeParentSeatId && <OrgChart tree={this.obtainSeatHierarchy(activeParentSeatId)} NodeComponent={OrgChartNode} />}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
