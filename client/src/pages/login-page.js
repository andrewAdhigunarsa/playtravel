import React from 'react';
import logo from "../assets/logo.svg";
import LoginForm from "../components/login-form";

function LoginPage(props) {
    return (
        <div className="App">
            <header className={'header'}>
                <img src={logo} alt="logo"/>
            </header>
            <LoginForm/>
        </div>
    );
}

export default LoginPage;
