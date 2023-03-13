import React, { Component, useState } from "react";

class Button extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <div className="container btn btn-outline-light" style={{display:'flex'}} width={'100%'}>
          <div className="col-4" style={{}}>
            <img src={this.props.svg} alt={this.props.alt} />
          </div>
          <div className="col-8">
            {this.props.name}
          </div>
      </div>
    );
  }
}
export default Button;
