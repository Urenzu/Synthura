import React from 'react'
import { GoogleLogin } from '@react-oauth/google'
import '../../App.css'

export default function LoginPage() {
    console.log("in login page")
    return (
      <>
        <h2>Sign in to Synthura</h2>

        <GoogleLogin className="google-auth"
          onSuccess={credentialResponse => {
            console.log(credentialResponse);
          }}
          onError={() => {
            console.log('Login Failed');
          }}
        />
      </>
    )
}