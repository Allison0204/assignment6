import React, { Component } from "react";
import "./App.css";
import FileUpload from "./FileUpload";
import Child1 from "./Child1";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data:null,
    };
  }

  set_data = (csv_data) => {
    this.setState({ data: csv_data });
  }

  render() {
    return (
      <div>
      <FileUpload set_data={this.set_data}></FileUpload>
      {this.state.data && <Child1 data={this.state.data} />}
      </div>
    );
  }
}

export default App;