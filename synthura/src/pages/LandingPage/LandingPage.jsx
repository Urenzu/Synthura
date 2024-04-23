import React from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { Link } from 'react-router-dom';
import './LandingPage.css'

const LandingPage = () => {
  return (
    <main>
      <nav>
        <Link className="nav-link" to="/main">Main Page</Link>
        <Link className="nav-link" to="/recordings">Recordings Page</Link>
      </nav>
      <h1>Synthura</h1>
      <p>Blurb about product. Blurb about product. Blurb about product. Blurb about product. Blurb about product. </p>
      <GoogleLogin
        onSuccess={credentialResponse => {
          console.log(credentialResponse);
        }}
        onError={() => {
          console.log('Login Failed');
        }}
      />
    </main>
  );
}

export default LandingPage


