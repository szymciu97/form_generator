import React, { Component } from 'react';
import dispatcher from '../Dispatcher'

class Forms extends Component {

  constructor() {
    super();

    this.state = {
      name: ''
    }

  }

  createForm(event) {
    event.preventDefault();
    const name = this.state.name;
    if (name) {
      dispatcher.dispatch({ type: 'CREATE_FORM', payload: { name } });
      
    }

  }

  handleChange(event) {
    this.setState({ name: event.target.value })


  }

  render() {
    return (
      <div className="container">
        <h1>Forms</h1>
        <div className="card">
          <div className="card-body" >
            <form onSubmit={this.createForm.bind(this)} >
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input value={this.state.name} onChange={this.handleChange.bind(this)} className="form-control" />
                <button className="btn btn-primary" >Save</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default Forms;
