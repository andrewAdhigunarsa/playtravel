import logo from './assets/logo.svg';
import './App.css';
import LoginForm from "./components/login-form";
import React, {useEffect, useState} from 'react';
import axios from "axios";

function App() {

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [country, setCountry] = useState('');
    const [fullName, setFullName] = useState('');
    const [token, setToken] = useState('');

    useEffect(()=>{
        if(sessionStorage.getItem('userToken')){
            setIsAuthenticated(true);
            setToken(sessionStorage.getItem('userToken'));
            fetchUserDetails();
        }
    }, [isAuthenticated])

      return (
        <div className="App">
            <header className={'header'}>
                <img src={logo} alt="logo"/>
            </header>
            {isAuthenticated?
                <div>
                    <p>Fullname: {fullName}</p>
                    <p>Country: {country}</p>
                </div>
                :
                <LoginForm handleAuth={(v)=>setIsAuthenticated(v)}/>}

        </div>
      );

    function fetchUserDetails(){
        axios({
            url: 'http://localhost:5000/graphql',
            method: 'post',
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: {
                query: `
                  query {
                      allUsers{
                        edges{
                          node{
                            id
                            email
                            fullName
                          }
                        }
                      }
                    }
                  `
            }
        }).then((result) => {
            console.log(result.data);
            if(result.data && result.data.data && result.data.data.edges  && result.data.data.edges.node && result.data.data.edges.node.fullName){
                setFullName(result.data.data.edges.node.fullName)
            }
            if(result.data && result.data.data && result.data.data.edges  && result.data.data.edges.node && result.data.data.edges.node.countryByCode && result.data.data.edges.node.countryByCode.name){
                setCountry(result.data.data.edges.node.countryByCode.name)
            }


        }).catch((err) => {
            console.error(err);
        })
    }
}

export default App;
