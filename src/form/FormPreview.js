import React, { Component } from 'react';
import formsStore from '../FormsDB';
import QuestionPreview from './QuestionPreview'

class FormPreview extends Component {

  constructor() {
    super();

    this.state = {
      form: {
        ...formsStore.selectedForm
      }
    }
  }

  render() {

    const childs = this.state.form.rootQuestions.map((el) => {
      return (<QuestionPreview key={el} id={el} ></QuestionPreview>);
    });

    return (
      <div className="container">
        <h1>Form Preview</h1>
        <div className="row">
          <div className="col-12" >
            {childs}
          </div>
        </div>
      </div>
    );
  }
}

export default FormPreview;
