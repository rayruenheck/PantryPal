"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link'
import SideBar from '../components/sidebar';
// Assuming SideBar and other necessary imports

export default function Page() {
  const [userToken, setUserToken] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('usertoken');
    if (token) {
      setUserToken(token);
      setFirstName(localStorage.getItem('first_name') || '');
      setEmail(localStorage.getItem('email') || '');
    }
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('usertoken');
    localStorage.removeItem('email');
    localStorage.removeItem('first_name');

    alert('You have been logged out successfully');
  };

  return (
    <>
      <SideBar />
      {userToken ? (
        <div className="flex flex-col items-center justify-center min-h-screen">
          {/* Illustration */}
          <img src="/illustration.png" alt="Illustration" className="mb-4" />
          {/* User Name */}
          <h1 className="text-2xl font-bold mb-2">{firstName}</h1>
          {/* User Email */}
          <p className="text-md mb-8">{email}</p>
          {/* Logout Button */}
          <Link legacyBehavior href="/">
          <button onClick={handleLogout} className="bg-red-500 text-white py-2 px-4 rounded">
            Log Out
          </button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <p>Please log in or make an account.</p>
          {/* Login/Register Button */}
          {/* Similarly, you'd navigate programmatically to your login or register page on click */}
          <Link legacyBehavior href="/login">
          <button onClick={() => {/* navigate to login or register */}} className="bg-blue-500 text-white py-2 px-4 rounded mt-4">
            Login
          </button>
          </Link>
        </div>
      )}
    </>
  );
}
