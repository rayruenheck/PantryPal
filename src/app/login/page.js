'use client'
import { useRouter } from 'next/navigation';
import {useState} from 'react'

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter()


  

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            'email': email.toLowerCase(),
            'password': password,
        }),
    });

    if (response.status === 200) {
        const data = await response.json();
        console.log(data);
        
        
        localStorage.setItem('accessToken', data.access_token); 
        localStorage.setItem('usertoken', data.usertoken); 
        localStorage.setItem('email', data.email); 

        
        alert(`Logged in successfully as ${data.email}`);
        router.push(`/`);
    } else {
        
        alert('Login failed. Please check your credentials.');
    }
}
  
  
  
  return (
    <div className='flex justify-center items-center h-screen bg-gray-100'>
      <form onSubmit={handleLogin} className='max-w-md w-full mx-auto p-8 bg-white rounded-lg shadow-xl'>
        <h2 className='text-3xl font-semibold text-center text-gray-800 mb-6'>Welcome</h2>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='w-full p-3 mb-4 text-lg rounded border border-gray-300 focus:outline-none focus:border-blue-500'
          type='email'
          name='email'
          placeholder='demo@demo.com'
          required
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='w-full p-3 mb-4 text-lg rounded border border-gray-300 focus:outline-none focus:border-blue-500'
          type='password'
          name='password'
          placeholder='123'
          required
        />
        <div className='flex justify-between items-center mb-6'>
          <span className='text-sm text-gray-600'>Don&apos;t have an account?</span>
          <a href="/register" className='text-sm text-blue-600 font-semibold hover:text-blue-800'>Register Here</a>
        </div>
        <button className='w-full p-3 bg-blue-500 text-white text-lg rounded hover:bg-blue-600' type='submit'>
          Login
        </button>
      </form>
    </div>
  )
  

}
