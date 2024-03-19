'use client';
import React, { useEffect, useState, useCallback } from 'react';
import IngredientCard from '../components/ingredientcard';
import { aisleDict } from '../components/aisleDict';
import Link from 'next/link';

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
      <IngredientCard
        ingredientList={data}
        updateIngredientsList={handleIngredientsListUpdate}
        checkCondition={(ingredient) => userToken ? pantryItems.some(item => item.id === ingredient.id) : ingredientsList.some(item => item.id === ingredient.id)}
      />
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
              <img 
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
        ))
      )}
      <div className="fixed bottom-16 left-0 right-0 px-8">
        <button className="w-full bg-green-500 text-tan-500 py-3 px-6 rounded-lg text-xl font-bold">
          Get Recipes
        </button>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md">
        <div className='w-full flex justify-around items-center py-4'>
          <Link href="/pantry" legacyBehavior><a className="text-gray-700 font-medium">Pantry</a></Link>
          <Link href="/recipes" legacyBehavior><a className="text-gray-700 font-medium">Recipes</a></Link>
          <Link href="/account" legacyBehavior><a className="text-gray-700 font-medium">Account</a></Link>
        </div>
      </div>
    </div>
  );
 }  