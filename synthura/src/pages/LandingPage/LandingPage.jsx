import React, { useState }  from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import './LandingPage.css';


const LandingPage = () => {
  const navigate = useNavigate();
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (username.length == 0) {
      console.log("Missing username");
      setMessage("Missing username");
      return;
    }

    if (password.length == 0) {
      console.log("Missing password");
      setMessage("Missing password");
      return;
    }
    setMessage("");
    const response = await axios.get(`https://us-west-2.aws.data.mongodb-api.com/app/application-1-urdjhcy/endpoint/checkUserExists?user=${username}&password=${password}`);
    console.log("Username: " + username);
    console.log("Password: " + password);
    console.log(response.data);

    if (response.data.success == true) {
      console.log("Logged IN!!!!");
      navigate("/main", {state: {username: username}});
    }
    else if (response.data.count == 1) {
      setMessage("Wrong Password");
      return;
    }
    else {
      setMessage("User Does Not Exist");
      return;
    }
  }

  return (
    <main>
      <h1>Synthura</h1>
      <p><strong>ENHANCE</strong> Your Security with <strong>CUTTING-EDGE AI</strong> Object Detection</p>
      <p>Monitor Live Video from Everyday Devices to Advanced Cameras</p>
      <form id="login-container" onSubmit={handleSubmit}>
        <h2>Login To Get Started</h2>
        <h3>{message}</h3>
        <div id="user-information-fields">
          <h3>Username</h3>
          <input type="text" onChange={e => setUserName(e.target.value)}/>
          <h3>Password</h3>
          <input type="password" onChange={e => setPassword(e.target.value)}/>
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