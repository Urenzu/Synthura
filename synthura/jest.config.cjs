module.exports = {
    transform: {
        '^.+\\.jsx?$': 'babel-jest',
    },
    testEnvironment: 'jsdom',
    "moduleNameMapper": {
        "\\.(css|less|scss|sass)$": "identity-obj-proxy"
    }
};
  