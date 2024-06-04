import React from 'react'
import { Link } from 'react-router-dom';
import './LandingPage.css'

const LandingPage = () => {
  return (
    <main>
      <h1>Synthura</h1>
      <p><strong>ENHANCE</strong> Your Security with <strong>CUTTING-EDGE AI</strong> Object Detection</p>
      <p>Monitor Live Video from Everyday Devices to Advanced Cameras</p>
      <form id="login-container">
        <h2>Login To Get Started</h2>
        <div id="user-information-fields">
          <h3>Username</h3>
          <input type="text" />
          <h3>Password</h3>
          <input type="password" />
          <p>
            New to Synthura? Sign up <Link id="register-link" to="/register">Here</Link>
          </p>
        </div>
        <span></span>
        <button id="login-button" type="submit">Login</button>
      </form>
    </main>
  );
}

export default LandingPage