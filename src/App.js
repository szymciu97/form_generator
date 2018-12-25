import React, { Component } from 'react';

import FormGenerator from './form/FormGenerator';
import Forms from './form/Forms';
import FormCreate from './form/FormCreate';
import FormPreview from './form/FormPreview';
import Layout from './Layout';
import formsStore from './FormsDB';

class App extends Component {

    constructor() {
        super();

        this.changePage = this.changePage.bind(this);

        this.state = {
            pages: {
                FormCreate, Forms, FormPreview, FormGenerator
            },
            currentPage: 'Forms'
        }
    }

    componentWillMount() {
        formsStore.on('changePage', this.changePage);
    }

    componentWillUnmount() {
        formsStore.removeListener('changePage', this.changePage)
    }

    changePage(currentPage) {
        this.setState({ currentPage })
    }

    render() {

        const TagName = this.state.pages[this.state.currentPage];

        return (
            <div>
                <Layout></Layout>
                <TagName />
            </div>

        );
    }
}


export default App;
