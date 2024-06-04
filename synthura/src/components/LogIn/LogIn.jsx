import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // for navigation
import './Login.css'; // Import the CSS file

function LoginSignup() {
  const [action, setAction] = useState('login'); // Login or Signup state
  const [username, setUsername] = useState(''); // Username state
  const [password, setPassword] = useState(''); // Password state
  const [error, setError] = useState(null); // Error message state

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'username') {
      setUsername(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };

  const handleLogin = () => {
    // Implement login functionality here (e.g., call an API)
    console.log('Login attempted with username:', username);

    //after they log in, route to tour page
    // useNavigate('/tour');
  };

  const handleSignup = () => {
    // implement later

    // if (!UniqueUsername(username)) {
    //   setError('That username is taken. Please try another one.');
    //   return;
    // }

    // if (!validateUsername(username)) {
    //   setError('Each username must contain at least one letter.');
    //   return;
    // }

    // if (!validatePassword(password)) {
    //   setError('Each password must contain a capital letter, a number, a special character, and be of at least 8 characters');
    //   return;
    // }
    // Implement signup functionality here (e.g., call an API)
    console.log('Signup attempted with username:', username, 'password:', password);
    setUsername('');
    setPassword('');

    //after they log in, route to tour page
    // useNavigate('/tour');
  };

  const validateUsername= (username) => {
    const regex = /^(?=.*[a-z])$/;
    return regex.test(username);
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)[^ ]{8,}$/;
    return regex.test(password);
  };

  const UniqueUsername= (username) => {
    //check to see if username already exists
  };

  return (
    <>
    <div className="login-wrapper">
      <div className="login-container">
        <button onClick={() => setAction('login')}>Login</button>
        <button onClick={() => setAction('signup')}>Sign Up</button>

    {action === 'login' && (
        <div className="login-form"> {/* New class for styling */}
            <div className="login-input-wrapper">
            Username: <input type="text" name="username" placeholder="Username" value={username} onChange={handleInputChange} className="login-input"/>
            </div>
            <div className="login-input-wrapper">
            Password: <input type="password" name="password" placeholder="Password" value={password} onChange={handleInputChange} className="login-input" />
            </div>
            <button onClick={handleLogin} className="login-submit">Login</button>
        </div>
      )}

      {action === 'signup' && (
        <div className="login-form"> {/* New class for styling */}
          <div className="login-input-wrapper">
            Username: <input type="text" name="username" placeholder="Username" value={username} onChange={handleInputChange} className="login-input"/>
            </div>
            <div className="login-input-wrapper">
            Password: <input type="password" name="password" placeholder="Password" value={password} onChange={handleInputChange} className="login-input" />
            </div>
            {/* {error && <p>{error}</p>} */}
          <button onClick={handleSignup} className="login-submit">Sign Up</button>
        </div>
      )}
      </div>
    </div>
    </>
  );
}

export default LoginSignup;
