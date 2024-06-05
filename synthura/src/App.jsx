import React from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import { EnvironmentsPageProvider } from './scripts/EnvironmentsPageContext.jsx';
import { CameraConnectionProvider } from './scripts/CameraConnectionContext.jsx';
import './App.css'
import EnvironmentsPage from './pages/EnvironmentsPage/EnvironmentsPage.jsx'
import RecordingsPage from './pages/RecordingsPage/RecordingsPage.jsx'
import LandingPage from './pages/LandingPage/LandingPage.jsx'
import SignUpPage from './pages/SignUpPage/SignUpPage.jsx';

function App() {

  console.log("in app page")
  return (
    <EnvironmentsPageProvider>
    <CameraConnectionProvider>
      <BrowserRouter>
        <Routes>
          <Route path = "/" element={<LandingPage/>}/>
          <Route path = "/register" element={<SignUpPage/>}/> 
          <Route path="/main" element={<EnvironmentsPage/>}/>
          <Route path="/recordings" element={<RecordingsPage/>}/>
          <Route path="*" element={<h1>Page Not Found</h1>}/>
        </Routes>
      </BrowserRouter>
    </CameraConnectionProvider>
    </EnvironmentsPageProvider>
  )
}

export default App

