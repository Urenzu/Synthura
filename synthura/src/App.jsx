import React from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import './App.css'
import LoginPage from './pages/loginPage.jsx'
import EnvironmentsPage from './pages/EnvironmentsPage.jsx'
import RecordingsPage from './pages/RecordingsPage.jsx'
import LandingPage from './pages/LandingPage.jsx'

function App() {

  console.log("in app page")
  return (
    <BrowserRouter>
      <Routes>
        <Route path = "/" element={<LandingPage/>}/> 
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/main" element={<EnvironmentsPage/>}/>
        <Route path="/recordings" element={<RecordingsPage/>}/>
        <Route path="*" element={<h1>Page Not Found</h1>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App

