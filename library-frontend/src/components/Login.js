import React, { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { LOGIN } from '../queries'


const Login = ({ setToken }) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const [ login, result ] = useMutation(LOGIN, {
        onError: (error) => {
            console.log(error)    }
        })
    useEffect(() => {
        if (result.data) {
            const token = result.data.login.value
            setToken(token)
            localStorage.setItem('authorapp-user-token', token)
        }
    }, [result.data])

    const submit = async (event) => {
        event.preventDefault()

        login({ variables: { username, password } })

    }

    return (
        <div>
            <form onSubmit={submit}>
                <div>
                username <input type='text' value={username} onChange={({ target }) => setUsername(target.value)} />
                </div>
                <div>
                password <input type='password' value={password} onChange={({ target }) => setPassword(target.value)}/>
                </div>
                <button type='submit'>login</button>
            </form>
        </div>
    )
}



export default Login