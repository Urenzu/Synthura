import React from 'react'
import { GoogleLogin } from '@react-oauth/google'
import '../App.css'
//GOOGLE_OAUTH_CLIENT_ID='581189616604-pr82ronvl9asp6pmsb780qn3dm69crrq.apps.googleusercontent.com'
//GOOGLE_OAUTH_CLIENT_SECRET='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'


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
  
