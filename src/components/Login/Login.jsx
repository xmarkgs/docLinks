import React from 'react';
import { GoogleLogin, GoogleLogout } from 'react-google-login';

const Login = ({ isLogged, loginAction, logoutAction, avatarLink }) => {
    if (isLogged) {
        return (
            <GoogleLogout
                clientId="982786168956-334v8t9r023r1g6juk228qlr7ecro1l0.apps.googleusercontent.com"
                buttonText="Logout"
                render={renderProps => (
                    <button className="logout-btn" onClick={renderProps.onClick} disabled={renderProps.disabled}>
                        <img src={avatarLink} alt="" className="user-avatar"/>
                        <img src="/logout.svg" alt=""/>
                    </button>
                )}
                onLogoutSuccess={logoutAction}
                onFailure={logoutAction}
            ></GoogleLogout>
        );
    } else {
        return (
            <GoogleLogin
                clientId="982786168956-334v8t9r023r1g6juk228qlr7ecro1l0.apps.googleusercontent.com"
                scope="email profile https://www.googleapis.com/auth/userinfo.profile openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive.readonly"
                render={renderProps => (
                    <button className="login-btn" onClick={renderProps.onClick} disabled={renderProps.disabled}>
                        <p className="login-btn__title">Login with Google</p>
                        <img src="/right-arrow.svg" alt="" />
                        <img src="/google-icon.svg" alt="" />
                    </button>
                )}
                buttonText="Login"
                onSuccess={loginAction}
                onFailure={loginAction}
                cookiePolicy={'single_host_origin'}
                isSignedIn={true}
            />
        );
    }
}

export default Login;