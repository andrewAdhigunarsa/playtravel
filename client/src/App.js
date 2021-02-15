import logo from './assets/logo.svg';
import './App.css';
import LoginForm from "./components/login-form";
import React, {useEffect, useState} from 'react';

function App() {

    const [currentUser, setCurrentUser] = useState('');

    useEffect(()=>{

    },[])

  return (
    <div className="App">
        <header className={'header'}>
            <img src={logo} alt="logo"/>
        </header>
      <LoginForm/>
    </div>
  );
}

export default App;
