import React, {useEffect, useState} from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import { NameComponentProvider } from './scripts/NameComponentContext';
import './App.css'
import EnvironmentsPage from './pages/EnvironmentsPage/EnvironmentsPage.jsx'
import RecordingsPage from './pages/RecordingsPage/RecordingsPage.jsx'
import LandingPage from './pages/LandingPage/LandingPage.jsx'
import TourPage from './pages/TourPage/TourPage.jsx';

function App() {

  console.log("in app page")
  return (
    <NameComponentProvider>
      <BrowserRouter>
        <Routes>
          <Route path = "/" element={<LandingPage/>}/> 
          <Route path="/main" element={<EnvironmentsPage/>}/>
          <Route path="/recordings" element={<RecordingsPage/>}/>
          <Route path="*" element={<h1>Page Not Found</h1>}/>
        </Routes>
      </BrowserRouter>
    </NameComponentProvider>
  )
}

export default App

