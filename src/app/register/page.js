'use client'
import { useState } from 'react'

export default function Page() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault(); 

    

    
      const response = await fetch('http://127.0.0.1:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            'email': email.toLowerCase(),
            'first_name' : firstName,
            'last_name' : lastName,
            'password': password
        }
        ),
      });

      if (response.status === 200) {
        alert('User registered successfully');
      } else if (response.status === 400) {
        console.log(response)
      } else {
        alert('Failed to register user');
      }
  }

  return (
    <div className='h-[100vh] w-full flex justify-center items-center flex-col'>
      <form onSubmit={handleRegister} className='h-1/2 w-3/4 md:w-1/2 rounded-md shadow-md flex flex-col justify-center items-center border-2'>
        <div>Register</div>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='border-2 mb-4 mt-4'
          type='email'
          name='email'
          placeholder='Email'
        />
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className='border-2 mb-4 mt-4'
          type='firstName'
          name='firstName'
          placeholder='First Name'
        />
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className='border-2 mb-4 mt-4'
          type='lastName'
          name='lastName'
          placeholder='Last Name'
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='border-2 mb-4'
          type='password'
          name='password'
          placeholder='Password'
        />
        <button className='border-2 w-[150px] rounded-md bg-blue-400' type='submit'>
          Register
        </button>
      </form>
    </div>
  );
}