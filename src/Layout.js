import React, { Component } from 'react';
import formsStore from './FormsDB';

class Layout extends Component {
    changePage(event) {
        formsStore.emit('changePage',event.target.value);
    }
    render() {
        return (
            <nav className="navbar navbar-expand navbar-light bg-light">
                <ul className="navbar-nav mr-auto">
                    <li className="nav-item active">
                        <button value="Forms" onClick={this.changePage} className="btn" >Forms</button>
                    </li>
                    <li className="nav-item active">
                        <button value="FormCreate" onClick={this.changePage} className="btn" >New Form</button>
                    </li>
                </ul>

            </nav>
        );
    }
}

export default Layout