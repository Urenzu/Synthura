import React from 'react'
import {Link} from 'react-router-dom'
import '../App.css'

export default function LandingPage() {
  console.log("in landing page")
  return (
    <>
      <h1>Welcome to</h1>
      <h2>Synthura</h2>

      <p>Blurb about product. Blurb about product. Blurb about product. Blurb about product. Blurb about product. </p>
      <div className="button2">
        <Link to="/login">Get Started</Link>
      </div>
    </>
  )
}

