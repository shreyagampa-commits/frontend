import React from 'react'
import {Navigate, Route, Routes} from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import Main from './pages/Main';
import UP from './pages/UP';
const App = () => {
  return (
    <div className='App'>
      <Routes>
            <Route path='/' element={ <Navigate to="/home"/>}></Route>
            <Route path='/login' element={<Login/>}></Route>
            <Route path='/signup' element={<Signup/>}></Route>
            <Route path='/home' element={<Home/>}></Route>
            <Route path='/main' element={<Main/>}></Route>
            <Route path='/up' element={<UP/>}></Route>
      </Routes>
      </div>
  )
}

export default App