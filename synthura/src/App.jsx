import React, {useEffect, useState} from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import './App.css'
import EnvironmentsPage from './pages/EnvironmentsPage/EnvironmentsPage.jsx'
import RecordingsPage from './pages/RecordingsPage/RecordingsPage.jsx'
import LandingPage from './pages/LandingPage/LandingPage.jsx'

/*
const RealmExample = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Fetch data from MongoDB Realm
        const response = await axios.get('https://us-west-2.aws.data.mongodb-api.com/app/application-1-urdjhcy/endpoint/book'); 
        setBooks(response.data);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="App">
      <h1>List of Books</h1>
      <ul>
        {books.map((book, index) => <li key={index}>{book.title}</li>)}
      </ul>
    </div>
  );
};

function App() {
  return (
    <RealmExample />
  );
}
*/

function App() {

  console.log("in app page")
  return (
    <BrowserRouter>
      <Routes>
        <Route path = "/" element={<LandingPage/>}/> 
        <Route path="/main" element={<EnvironmentsPage/>}/>
        <Route path="/recordings" element={<RecordingsPage/>}/>
        <Route path="*" element={<h1>Page Not Found</h1>}/>
      </Routes>
    </BrowserRouter>
    
  )
}

export default App

