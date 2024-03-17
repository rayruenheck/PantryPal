'use client';
import React, { useEffect, useState, useCallback } from 'react';
import IngredientCard from '../components/ingredientcard';
import { aisleDict } from '../components/aisleDict';

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
    <div className='h-screen w-full'>
      {userToken && <button onClick={handleLogout}>Logout</button>}
      <h1 className="text-4xl font-bold mb-4 text-center pt-10">Suggested Recipes</h1>
      <div className="search-container mx-auto max-w-3xl p-5">
        <div className="search-box flex items-center border-2 rounded-lg border-gray-500 mb-8 bg-white">
          <input
            value={ingredient}
            onChange={(e) => setIngredient(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setIngredientsList(prev => [...prev, { id: Date.now().toString(), name: ingredient }]); // Example to convert string to object
                setIngredient('');
              }
            }}
            className='flex-1 py-2 px-4 rounded-lg bg-transparent placeholder-gray-500 focus:outline-none'
            type='text'
            placeholder='Search for ingredients'
          />
        </div>      
      </div>
      <IngredientCard
            ingredientList={data}
            updateIngredientsList={handleIngredientsListUpdate}
            checkCondition={(ingredient) => userToken ? pantryItems.some(item => item.id === ingredient.id)  : ingredientsList.some(item => item.id === ingredient.id)}
          />
      <div>
      <div className='w-full flex justify-center items-center'>
        <p onClick={() => setUserPantryClicked(false)}>Suggested Ingredients</p>
        <p className='ml-6' onClick={() => { fetchPantryItems(); setUserPantryClicked(true); }}>Your Pantry</p>
      </div>
        {userPantryClicked ? (
          <IngredientCard
            ingredientList={userToken ? pantryItems : ingredientsList}
            updateIngredientsList={handleIngredientsListUpdate}
            checkCondition={(ingredient) => userToken ? pantryItems.some(item => item.id === ingredient.id) : ingredientsList.some(item => item.id === ingredient.id)}
          />
        ) : (
          Object.keys(aisleDict).map((aisle) => (
            <div key={aisle} className="mb-4">
              <button
                className="py-2 px-4 w-full text-left rounded-lg bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                onClick={() => setOpenDropdown(openDropdown === aisle ? null : aisle)}
              >
                {aisle}
              </button>
              {openDropdown === aisle && (
                <div className="mt-2 space-y-2">
                  <IngredientCard
                    ingredientList={aisleDict[aisle]}
                    updateIngredientsList={handleIngredientsListUpdate}
                    checkCondition={(ingredient) => userToken ? pantryItems.some(item => item.id === ingredient.id) : ingredientsList.some(item => item.id === ingredient.id)}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <a href="/searchrecipe">search</a>
    </div>
  );
}
