import React from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { Link } from 'react-router-dom';
import './LandingPage.css'
import LoginSignup from '../../components/LogIn/LogIn';


const LandingPage = () => {
  return (
    <main>
      <h1>Synthura</h1>
      {/* <p>Blurb about product. Blurb about product. Blurb about product. Blurb about product. Blurb about product. </p> */}
      <LoginSignup/>
    </main>
  );
}

export default LandingPage