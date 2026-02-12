import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
    return (
        <nav style={{ padding: '1rem', backgroundColor: '#333', marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
            <Link to="/" style={{ color: 'white' }}>Home</Link>
            <Link to="/about" style={{ color: 'white' }}>About</Link>
            <Link to="/contact" style={{ color: 'white' }}>Contact</Link>
            <Link to="/login" style={{ color: 'white' }}>Login</Link>
            <Link to="/signup" style={{ color: 'white' }}>Signup</Link>
        </nav>
    )
}

export default Header
