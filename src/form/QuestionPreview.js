import React, { Component } from 'react';

import formsStore from '../FormsDB';

class QuestionPreview extends Component {

    constructor(params) {
        super(params);

        this.state = { question: { ...(formsStore.questions.find((el) => { return params.id === el.id })) }, answer: '' }
    }

    getInput() {
        switch (this.state.question.type) {
            case 'text': {
                return (<input onChange={this.answerChanged.bind(this)} value={this.state.answer} name={'answer' + this.state.question.id} type="text" className="form-control" />);
            }
            case 'boolean': {
                return (
                    <div className="form-control" >
                        <label className=" mx-3 radio-inline" ><input onChange={this.answerChanged.bind(this)} name={'answer' + this.state.question.id} type="radio" checked={this.state.answer === 'true'} value="true" /> Yes </label>
                        <label className="radio-inline" ><input onChange={this.answerChanged.bind(this)} name={'answer' + this.state.question.id} type="radio" checked={this.state.answer === 'false'} value="false" />No </label>
                    </div>
                );
            }
            case 'number': {
                return (<input onChange={this.answerChanged.bind(this)} value={this.state.answer} name={'answer' + this.state.question.id} type="number" className="form-control" />);
            }
            default: return;
        }
    }

    answerChanged(event) {
        this.setState({ answer: event.target.value })
    }

    changeType(event) {
        this.setState({ type: event.target.value });
    }

    getSubquestions() {
        return this.state.question.subQuestions.map(qID => {

            const q = formsStore.questions.find((el) => { return qID === el.id });

            switch (q.condition.type) {
                case 'eq': {
                    switch (this.state.question.type) {
                        case 'text': {

                            if (this.state.answer.trim().toLowerCase() === q.condition.value.trim().toLowerCase()) {
                                return (<QuestionPreview key={q.id} id={q.id} ></QuestionPreview>);
                            }

                            break;
                        }
                        case 'boolean': {
                            if (this.state.answer === q.condition.value) {
                                return (<QuestionPreview key={q.id} id={q.id} ></QuestionPreview>);
                            }
                            break;
                        }
                        case 'number': {
                            if (parseInt(this.state.answer) === parseInt(q.condition.value)) {
                                return (<QuestionPreview key={q.id} id={q.id} ></QuestionPreview>);
                            }

                            break;
                        }
                        default: { }

                    }
                    break;
                }

                case 'lt': {
                    if (parseInt(this.state.answer) < parseInt(q.condition.value)) {
                        return (<QuestionPreview key={q.id} id={q.id} ></QuestionPreview>);
                    }
                    break;
                }
                case 'gt': {
                    if (parseInt(this.state.answer) > parseInt(q.condition.value)) {
                        return (<QuestionPreview key={q.id} id={q.id} ></QuestionPreview>);
                    }
                    break;
                }
                default: { }

            }

            return undefined;
        });
    }

    render() {
        return (
            <div>
                <div className="container" >
                    <div className="form-group">
                        <label htmlFor="answer">{this.state.question.question}</label>
                        {this.getInput()}
                    </div>
                    <div className="container" >
                        {this.getSubquestions()}
                    </div>
                </div>
            </div>
        );
    }
}

export default QuestionPreview;
