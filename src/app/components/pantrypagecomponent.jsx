import React, { useEffect, useState, useCallback } from 'react';
import IngredientCard from '../components/ingredientcard';
import { aisleDict } from '../components/aisleDict';
import Link from 'next/link';
import Image from 'next/image';

export default function PantryPageComponent() {
    const apiKey = process.env.NEXT_PUBLIC_SECRET_API_KEY;
    const [data , setData] = useState([])
    const [openDropdown, setOpenDropdown] = useState(aisleDict["Most Common"] ? "Most Common" : null)
    const [pantryItems, setPantryItems] = useState([]);
    const [ingredient, setIngredient] = useState('');
    const [ingredientsList, setIngredientsList] = useState(() => {
      if (typeof window === 'undefined') {
        return []; 
    }
      const storedList = sessionStorage.getItem('ingredientsList');
      return storedList ? JSON.parse(storedList) : [];
    })
  
    useEffect(() => {
      sessionStorage.setItem('ingredientsList', JSON.stringify(ingredientsList));
    }, [ingredientsList])
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
          const ingredientsArray = data.results.map(result => ({ 'id': result.id, 'name': result.name }))
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
      const index = ingredientsList.findIndex(item => item.name === ingredient.name);
    
      
      let updatedList;
      if (index === -1) {
          
          updatedList = [...ingredientsList, ingredient];
      } else {
          
          updatedList = ingredientsList.filter((_, i) => i !== index);
      }
    
      
      setIngredientsList(updatedList)
    
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
      } 
    }
  
   
    
    
    
  
  
   
  
    return (  
        <div className='bg-white px-8 py-10 md:pl-[137px] pb-[60px] h-screen overflow-y-auto'>
         
          
          <h1 className="text-4xl font-bold mb-8 text-center">Add ingredients to your pantry</h1>
  
         
          <div className="flex items-center justify-between mb-8">
            <h2 onClick={() => setUserPantryClicked(false)} className={`${!userPantryClicked ? 'text-[#558918] underline' : 'text-gray-800'}text-xl font-semibold cursor-pointer`}>Add ingredients</h2>
            <h2 onClick={() => { fetchPantryItems(); setUserPantryClicked(true); }} className={`${userPantryClicked ? 'text-[#558918] underline' : 'text-gray-800'}text-xl font-semibold cursor-pointer`}>In your pantry</h2>
          </div>
  
          
          <div className="search-box flex items-center border-2 rounded-lg border-gray-500 mb-8 bg-white">
            <input
              value={ingredient}
              onChange={(e) => setIngredient(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  // TODO: Implement search functionality
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
          checkCondition={(ingredient) => userToken ? pantryItems.some(item => item.id === ingredient.id)  : ingredientsList.some(item => item.id === ingredient.id)}
          IngredientClicked={false}
        />
  
          
          {userPantryClicked ? (
            <IngredientCard
              ingredientList={userToken ? pantryItems : ingredientsList}
              updateIngredientsList={handleIngredientsListUpdate}
              checkCondition={(ingredient) => userToken ? pantryItems.some(item => item.id === ingredient.id) : ingredientsList.some(item => item.id === ingredient.id)}
              IngredientClicked={false}
            />
          ) : (
            Object.keys(aisleDict).map((aisle) => (
              <div key={aisle} className="mb-3">
                <button
                  className="w-full text-left text-xl font-medium bg-white py-1 px-1 mb-6 rounded-lg flex justify-between items-center"
                  onClick={() => setOpenDropdown(openDropdown === aisle ? null : aisle)}
                >
                  {aisle}
                  <Image
                width={10}
                height={10}            
                src="/dropdown.png" 
                alt="Dropdown icon" 
                className="w-6 h-6" 
                style={{
                  transform: openDropdown === aisle ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.3s ease-in-out'
                }}
                />
                </button>
                {openDropdown === aisle && (
                  <div className="mt-4 mb-10 bg-white ">
                    <IngredientCard
                      ingredientList={aisleDict[aisle]}
                      updateIngredientsList={handleIngredientsListUpdate}
                      checkCondition={(ingredient) => ingredientsList.some(item => item.id === ingredient.id)}
                      IngredientClicked={false}
                    />
                  </div>
                )}
              </div>
            ))
          )}
  
          
          <div className='fixed w-full bottom-14 left-0 right-0 bg-white  flex justify-center items-center  md:px-0 md:static'>
            <Link legacyBehavior href='/recipes'>
              <button className="w-5/6 bg-[#67A320]  text-white py-3 px-6 mb-6 mt-6 rounded-lg text-xl font-bold">
                Get Recipes
              </button>
            </Link>
          </div>
        </div>
      
    )
}
