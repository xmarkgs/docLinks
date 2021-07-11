import React, { Component } from 'react';
import '../Main/main.css';
import './unauthenticated.css';

class MainUnauthenticated extends Component {
    render() {
        return (
            <>
            <div className="container">
                <header>
                    <div className="header__container">
                        <h1 className="app-title">docLinks</h1>
                    </div>  
                </header>
                <div className="login-section">
                    <p className="login-section__slogan">
                        find the linkage between your Google Doc files
                    </p>
                    {this.props.children}
                </div>
            </div>
            </>
        )
    }
}

export default MainUnauthenticated;