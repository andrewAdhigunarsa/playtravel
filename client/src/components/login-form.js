import React, { useRef, useEffect } from 'react';
import { useForm } from "react-hook-form";
import axios from 'axios';

function LoginForm(props) { const { register, setError, errors, watch, handleSubmit } = useForm();
    const password = useRef({});
    password.current = watch("password", "");
    const onSubmit = async data => {
        axios({
            url: 'http://localhost:5000/graphql',
            method: 'post',
            data: {
                query: `
                  mutation {
                      login(input: {email:"${data.email}", password: "${data.password}"}) {
                        jwtToken
                      }
                    }
                  `
            }
        }).then((result) => {
            console.log(result.data.data.login.jwtToken)
            if(result.data.data.login && result.data.data.login.jwtToken === null){
                setError("email", {
                    type: "manual",
                    message: ""
                });
                setError("password", {
                    type: "manual",
                    message: "Credential is not right"
                });
            }else if (result.data.data.login && result.data.data.login.jwtToken !== null){
                window.alert("logging in")
                props.handleAuth(true);
                sessionStorage.setItem('userToken', result.data.data.login.jwtToken);
            }

        }).catch((err) => {
            console.error(err);
            setError("email", {
                type: "manual",
                message: ""
            });
            setError("password", {
                type: "manual",
                message: "Credential is not right"
            });
        })
    };

    useEffect(()=>{

    },[])



    return (
        <form className={'login-form'} onSubmit={handleSubmit(onSubmit)}>
            <h3 className={'form-header'}>Log in to your account</h3>
            <div className={'input-wrapper'}>
                <label className={`${errors.email && 'error-msg'} label`} htmlFor="email">Email</label>
                <input className={`${errors.email && 'input-error'} input`}
                       name="email"
                       ref={register({
                           required: "Required",
                           pattern: {
                               value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                               message: "invalid email address"
                           }
                       })}
                />
                {errors.email && <p className={'error-msg'}>{errors.email.message}</p>}
            </div>
            <div className={'input-wrapper'}>
                <label className={`${errors.password && 'error-msg'} label`} htmlFor="password">Password</label>
                <input className={`${errors.password && 'input-error'} input`}
                       name="password"
                       type="password"
                       ref={register({
                           required: "You must specify a password",
                           minLength: {
                               value: 8,
                               message: "Password must have at least 8 characters"
                           }
                       })}
                />
                {errors.password && <p className={'error-msg'}>{errors.password.message}</p>}
            </div>
            <div className={'input-wrapper'}>
                Forgot Password? <a href="/">Reset</a>
            </div>
            <button className={'button'} type={'submit'}>Log in</button>
        </form>
    );
}

export default LoginForm;
