// Popup.jsx
import React, { useState, useEffect } from 'react';
import './PopUp.css'

const Popup = ({ message, buttons, onButtonClick , position}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowPopup(true);
      // Start flashing after a delay (adjust delay as needed)
      const flashInterval = setInterval(() => setIsFlashing(!isFlashing), 500);
      return () => {
        clearInterval(flashInterval);
      };
    }, 1000); // Show popup after 1 second delay (adjust as needed)
    return () => clearTimeout(timeout);
  }, []);

  const handleButtonClick = (index) => {
    onButtonClick(index);
    setShowPopup(false);
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return { top: '20%', left: '20%' };
      case 'two-thirds-left':
        return { top: '40%', left: '40%' };
      case 'top-center':
        return { top: '10%', left: '50%' };
      case 'top-right':
        return { top: '30%', left: '80%' };
      case 'center':
        return { top: '50%', left: '50%' };
      case 'middle-left':
        return { top: '50%', left: '30%' };
      case 'bottom-left':
        return { bottom: '10%', left: '10%' };
      case 'bottom-center':
        return { bottom: '10%', left: '50%' };
      case 'bottom-right':
        return { bottom: '10%', left: '90%' };
      default:
        return { top: '50%', left: '50%'};
    }
  };

  return (
    showPopup && (
      <div className={`popup ${isFlashing ? 'flashing' : ''}`} style={getPositionStyles()}>
        <p>{message}</p>
        <div className="button-container">
          {buttons.map((button, index) => (
            <button key={index} onClick={() => handleButtonClick(index)}>
              {button}
            </button>
          ))}
        </div>
      </div>
    )
  );
};

export default Popup;
