import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/home.jsx'
import Signup from './pages/signup.jsx'
import Login from './pages/login.jsx'
import Dashboard from './pages/dashboard.jsx'
import Admin from './pages/admin.jsx'
import Header from './components/header.jsx'
import Footer from './components/footer.jsx'

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Header />
        <main className="flex-1 bg-white dark:bg-gray-950">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
