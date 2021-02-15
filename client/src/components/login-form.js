import React, { useRef } from 'react';
import { useForm } from "react-hook-form";

function LoginForm(props) { const { register, errors, watch, handleSubmit } = useForm();
    // const onSubmit = data => console.log(data);
    const password = useRef({});
    password.current = watch("password", "");
    const onSubmit = async data => {
        alert(JSON.stringify(data));
    };

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
