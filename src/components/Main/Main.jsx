import React, { Component } from 'react';
import './main.css';
import Login from '../Login/Login';
import MainAuthenticated from '../MainAuthenticated/MainAuthenticated';
import MainUnauthenticated from '../MainUnauthenticated/MainUnauthenticated';

class Main extends Component {
    state = {
        googleAuth: {},
        userName: "",
        avatarLink: "",
    }

    responseGoogle = (googleAuth) => {
        let { profileObj: { name: userName } } = googleAuth;
        let { profileObj: { imageUrl: avatarLink } } = googleAuth;
        console.log(googleAuth);
        this.setState({
            googleAuth,
            userName,
            avatarLink
        })
    }

    logoutAction = () => {
        this.setState({
            googleAuth: {},
            userName: ""
        })
    }

    render() {
        let { googleAuth, userName, avatarLink } = this.state;
        let isLogged = false;
        if (userName.length >= 1) {
            isLogged = true;
        }
        return (
            <>
                { isLogged ? 
                <MainAuthenticated googleAuth={googleAuth}>
                <Login isLogged={isLogged} loginAction={this.responseGoogle} logoutAction={this.logoutAction} avatarLink={avatarLink} />
                </MainAuthenticated> 
                : <MainUnauthenticated>
                <Login isLogged={isLogged} loginAction={this.responseGoogle} logoutAction={this.logoutAction} />
                </MainUnauthenticated> }
            </>
        )
    }
}

export default Main;