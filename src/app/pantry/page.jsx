'use client';
import React, { useEffect, useState, useCallback } from 'react';
import IngredientCard from '../components/ingredientcard';
import { aisleDict } from '../components/aisleDict';
import Link from 'next/link';
import Image from 'next/image';

export default function Page() {
  const apiKey = process.env.NEXT_PUBLIC_SECRET_API_KEY;
  const [data , setData] = useState([])
  const [openDropdown, setOpenDropdown] = useState(null);;
  const [pantryItems, setPantryItems] = useState([]);
  const [ingredient, setIngredient] = useState('');
  const [ingredientsList, setIngredientsList] = useState([]);;
  const [userToken, setUserToken] = useState('')
  const [userPantryClicked, setUserPantryClicked] = useState(false)
  useEffect(() => {
    fetch(`https://api.spoonacular.com/food/ingredients/search?query=${ingredient}`, {
        method: 'GET',
        headers: {
            'x-api-key': apiKey 
        }
    })
    .then(response => response.json())
    .then(data => {
        const ingredientsArray = data.results.map(result => ({ id: `${result.id}`, name: result.name }))
        setData(ingredientsArray || []);            
    })
    .catch(error => {
        console.error('Error fetching data: ', error);
    });
}, [ingredient, apiKey]);


  const fetchPantryItems = useCallback(async () => {
    if (!userToken) return;

    try {
      const response = await fetch('http://localhost:5000/get_user_pantry_items', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pantry items');
      }

      const data = await response.json();
      setPantryItems(data);
      
    } catch (error) {
      console.error("Error fetching pantry items:", error.message);
    }
  }, [userToken]); 

  
  useEffect(() => {
    const token = localStorage.getItem('usertoken') || '';
    setUserToken(token);
  }, []); 

  useEffect(() => {
    if (userToken) fetchPantryItems();
  }, [userToken, fetchPantryItems]);

  
  useEffect(()=>{
    console.log(pantryItems)
  },[pantryItems])

  const handleIngredientsListUpdate = async (ingredient) => {
    let currentList = JSON.parse(sessionStorage.getItem('ingredientsList')) || [];

 
  const index = currentList.findIndex(item => item.id === ingredient.id);

  if (index === -1) {
    
    currentList.push(ingredient);
  } else {
    
    currentList.splice(index, 1);
  }
  sessionStorage.setItem('ingredientsList', JSON.stringify(currentList));


  setIngredientsList(currentList);
  
    if (userToken) {
      try {
        const response = await fetch('http://127.0.0.1:5000/handle_user_ingredient_list', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            usertoken: userToken,
            name: ingredient.name,
            id: ingredient.id,
          }),
        });
  
        if (response.ok) {
          fetchPantryItems();
        } else {
          
          console.error('Failed to update ingredients in the database');
        }
      } catch (error) {
        
        console.error('Error updating ingredients:', error);
      }
    } else {    
      console.log("Updated ingredientsList:", currentList) 
    }
  }

 
  
  const handleLogout = async () => {
    localStorage.removeItem('accessToken'); 
    localStorage.removeItem('usertoken');
    localStorage.removeItem('email');

    alert('You have been logged out successfully')
  };
















































  return (
    <div className='h-screen w-full overflow-y-auto bg-white px-8 py-10'>
      {userToken && (
        <button
          className="absolute top-4 right-4 bg-blue-500 text-white py-1 px-4 rounded-full"
          onClick={handleLogout}
        >
          Logout
        </button>
      )}
      <h1 className="text-4xl font-bold mb-8 text-center">Add ingredients to your pantry</h1>
      <div className="flex items-center justify-between mb-4">
        <h2
          onClick={() => setUserPantryClicked(false)}
          className={`text-xl font-semibold cursor-pointer ${!userPantryClicked ? 'text-green-500 border-b-2 border-green-500 pb-1' : ''}`}
        >
          Add ingredients
        </h2>
        <h2
          onClick={() => { fetchPantryItems(); setUserPantryClicked(true); }}
          className={`text-xl font-semibold cursor-pointer ${userPantryClicked ? 'text-green-500 border-b-2 border-green-500 pb-1' : ''}`}
        >
          In your pantry
        </h2>
      </div>
      <div className="search-box flex items-center border-2 rounded-lg border-gray-500 mb-8 bg-white">
        <input
          value={ingredient}
          onChange={(e) => setIngredient(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              // Implement search functionality here
            }
          }}
          className='flex-1 py-2 px-4 rounded-lg bg-transparent placeholder-gray-500 focus:outline-none'
          type='text'
          placeholder='Search for ingredients'
        />
      </div>
      {userPantryClicked ? null :
        <IngredientCard
            ingredientList={data}
            updateIngredientsList={handleIngredientsListUpdate}
            checkCondition={(ingredient) => userToken ? pantryItems.some(item => item.id === ingredient.id)  : ingredientsList.some(item => item.id === ingredient.id)}
          />}
            {userPantryClicked ? (
          <IngredientCard
            ingredientList={userToken ? pantryItems : ingredientsList}
            updateIngredientsList={handleIngredientsListUpdate}
            checkCondition={(ingredient) => userToken ? pantryItems.some(item => item.id === ingredient.id) : ingredientsList.some(item => item.id === ingredient.id)}
          />
        ) : (
        Object.keys(aisleDict).map((aisle) => (
          <div key={aisle} className="mb-8">
            <button
              className="w-full text-left text-xl font-medium bg-white py-3 px-6 rounded-lg flex justify-between items-center"
              onClick={() => setOpenDropdown(openDropdown === aisle ? null : aisle)}
            >
              {aisle}
              <Image
              width={10}
              height={10}
              
                src="/dropdown.png" 
                alt="Dropdown icon" 
                className="w-6 h-6" 
              />
            </button>
            {openDropdown === aisle && (
              <div className="mt-4 bg-white py-4 px-6 rounded-lg shadow">
                <IngredientCard
                  ingredientList={aisleDict[aisle]}
                  updateIngredientsList={handleIngredientsListUpdate}
                  checkCondition={(ingredient) => ingredientsList.some(item => item.id === ingredient.id)}
                />
              </div>
            )}
          </div>
        )))}
        <div className="fixed bottom-16 left-0 right-0 px-8">
          <button href='/recipes' className="w-full bg-green-500 text-tan-500 py-3 px-6 rounded-lg text-xl font-bold">
            Get Recipes
          </button>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md">
        <div className='w-full flex justify-around items-center py-4'>
          <Link href="/pantry" legacyBehavior><a className="flex flex-col items-center text-gray-700 font-medium">Pantry{<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.4225 28C6.7565 28 6.1865 27.7527 5.7125 27.2581C5.2375 26.7645 5 26.1709 5 25.4774V12.8612C5 12.4613 5.086 12.0828 5.258 11.7256C5.429 11.3684 5.666 11.0737 5.969 10.8415L14.0465 4.50452C14.4685 4.16817 14.9515 4 15.4955 4C16.0385 4 16.5245 4.16817 16.9535 4.50452L25.031 10.8415C25.334 11.0737 25.571 11.3684 25.742 11.7256C25.914 12.0828 26 12.4613 26 12.8612V25.4774C26 26.1709 25.7625 26.7645 25.2875 27.2581C24.8135 27.7527 24.2435 28 23.5775 28H7.4225ZM13.5965 23.8545C13.7765 23.8545 13.9275 23.7915 14.0495 23.6655C14.1695 23.5395 14.2295 23.3822 14.2295 23.1938V18.5687C14.7595 18.5687 15.2095 18.376 15.5795 17.9908C15.9495 17.6055 16.1345 17.1369 16.1345 16.585V13.2814C16.1345 13.0939 16.074 12.9367 15.953 12.8096C15.832 12.6826 15.681 12.6196 15.5 12.6206C15.32 12.6206 15.169 12.6836 15.047 12.8096C14.925 12.9356 14.8645 13.0929 14.8655 13.2814V16.585H14.231V13.2814C14.231 13.0939 14.1705 12.9367 14.0495 12.8096C13.9285 12.6836 13.7775 12.6206 13.5965 12.6206C13.4155 12.6206 13.2645 12.6836 13.1435 12.8096C13.0225 12.9356 12.962 13.0929 12.962 13.2814V16.585H12.3275V13.2814C12.3275 13.0939 12.2665 12.9367 12.1445 12.8096C12.0245 12.6836 11.874 12.6206 11.693 12.6206C11.512 12.6206 11.361 12.6836 11.24 12.8096C11.118 12.9356 11.057 13.0929 11.057 13.2814V16.585C11.057 17.1369 11.242 17.6055 11.612 17.9908C11.982 18.376 12.432 18.5687 12.962 18.5687V23.1938C12.962 23.3812 13.022 23.5384 13.142 23.6655C13.262 23.7925 13.4135 23.8555 13.5965 23.8545ZM18.6725 23.8545C18.8535 23.8545 19.0045 23.7915 19.1255 23.6655C19.2465 23.5395 19.307 23.3822 19.307 23.1938V13.4782C19.307 13.2366 19.227 13.0335 19.067 12.869C18.907 12.7024 18.7095 12.6191 18.4745 12.6191C17.8975 12.6191 17.469 12.895 17.189 13.4469C16.909 13.9978 16.769 14.6033 16.769 15.2635V17.9626C16.769 18.3219 16.8925 18.6062 17.1395 18.8155C17.3865 19.0248 17.6665 19.1628 17.9795 19.2294H18.0395V23.1938C18.0395 23.3812 18.0995 23.5384 18.2195 23.6655C18.3415 23.7915 18.4925 23.8545 18.6725 23.8545Z" fill="#222222"/>
</svg>}</a></Link>
          <Link href="/recipes" legacyBehavior><a className="flex flex-col items-center text-gray-700 font-medium">Recipes{<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6 10.5V8.3H8.22222V7.2C8.22222 6.61652 8.45635 6.05694 8.8731 5.64437C9.28984 5.23178 9.85507 5 10.4444 5H17.1111V12.7L19.8889 11.05L22.6667 12.7V5H23.7778C24.9444 5 26 6.045 26 7.2V24.8C26 25.955 24.9444 27 23.7778 27H10.4444C9.27778 27 8.22222 25.955 8.22222 24.8V23.7H6V21.5H8.22222V17.1H6V14.9H8.22222V10.5H6ZM10.4444 14.9H8.22222V17.1H10.4444V14.9ZM10.4444 10.5V8.3H8.22222V10.5H10.4444ZM10.4444 23.7V21.5H8.22222V23.7H10.4444Z" fill="#222222"/>
</svg>}</a></Link>
          <Link href="/account" legacyBehavior><a className="flex flex-col items-center text-gray-700 font-medium">Account{<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16 24.64C13 24.64 10.348 23.104 8.8 20.8C8.836 18.4 13.6 17.08 16 17.08C18.4 17.08 23.164 18.4 23.2 20.8C22.4067 21.9813 21.335 22.9494 20.0795 23.619C18.8239 24.2886 17.423 24.6393 16 24.64ZM16 7.6C16.9548 7.6 17.8705 7.97929 18.5456 8.65442C19.2207 9.32955 19.6 10.2452 19.6 11.2C19.6 12.1548 19.2207 13.0705 18.5456 13.7456C17.8705 14.4207 16.9548 14.8 16 14.8C15.0452 14.8 14.1295 14.4207 13.4544 13.7456C12.7793 13.0705 12.4 12.1548 12.4 11.2C12.4 10.2452 12.7793 9.32955 13.4544 8.65442C14.1295 7.97929 15.0452 7.6 16 7.6ZM16 4C14.4241 4 12.8637 4.31039 11.4078 4.91345C9.95189 5.5165 8.62902 6.40042 7.51472 7.51472C5.26428 9.76516 4 12.8174 4 16C4 19.1826 5.26428 22.2348 7.51472 24.4853C8.62902 25.5996 9.95189 26.4835 11.4078 27.0866C12.8637 27.6896 14.4241 28 16 28C19.1826 28 22.2348 26.7357 24.4853 24.4853C26.7357 22.2348 28 19.1826 28 16C28 9.364 22.6 4 16 4Z" fill="#222222"/>
</svg>}</a></Link>
        </div>
        </div>
      </div>
    
  );
  
 }  