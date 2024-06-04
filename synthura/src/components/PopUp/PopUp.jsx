// Popup.jsx
import React, { useState, useEffect } from 'react';

const Popup = ({ message, buttons, onButtonClick }) => {
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

  return (
    showPopup && (
      <div className={`popup ${isFlashing ? 'flashing' : ''}`}>
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
