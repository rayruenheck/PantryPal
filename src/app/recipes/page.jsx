'use client'
import { useState, useEffect, useCallback } from 'react'
import RecipeCard from '../components/recipecard'
import Link from 'next/link';


export default function Page() {
    const apiKey = process.env.NEXT_PUBLIC_SECRET_API_KEY
    const [selectedTime, setSelectedTime] = useState(200)
    const [pantryItems, setPantryItems] = useState([])
    const [ingredientsList, setIngredientsList] = useState([]);
    const [recipeArray, setRecipeArray]= useState([])
    const [userToken, setUserToken] = useState('')

    useEffect(() => {
      const token = localStorage.getItem('usertoken') || '';
      setUserToken(token);
    }, [])

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
    }, [userToken])

    useEffect(() => {
      if (userToken) fetchPantryItems();
    }, [userToken, fetchPantryItems])

    

 
    useEffect(() => {
      
      let currentList = JSON.parse(sessionStorage.getItem('ingredientsList')) || [];
    
      if (userToken && pantryItems.length > 0) {
       
        setIngredientsList(pantryItems.map(item => item.name)); 
      } else {
        
        setIngredientsList(currentList.map(item=> item.name));
      }
    }, [userToken, pantryItems])

    const ingredientsListToString = (ingredientsList) => {
      
      return ingredientsList.join(', ');
    };
  
    useEffect(() => {
      if (ingredientsList.length > 0) {
        fetch(`https://api.spoonacular.com/recipes/complexSearch?includeIngredients=${ingredientsListToString(ingredientsList)}&number=50&addRecipeInformation=true&fillIngredients=true&maxReadyTime=${selectedTime}&sort=min-missing-ingredients&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
          const tempRecipeArray = data.results.map(item => {
            return {
              id: item.id,
              title: item.title,
              link: item.sourceUrl,
              image: item.image,
              time: item.readyInMinutes,
              missedIngredientCount: item.missedIngredientCount,
              missingIngredients: item.missedIngredients,
              usedIngredients: item.usedIngredients,
            };
          });
          console.log(tempRecipeArray)
          setRecipeArray(tempRecipeArray);
        })
        .catch(error => {
          console.error('Error fetching data: ', error);
        });
      }
    }, [ingredientsList, apiKey, selectedTime]);
  
    const handleTimeFilter = (time) => {
      setSelectedTime(time);
    };
   


    
  
    return (
      <div className='h-screen w-full bg-gray-100'>
          <div className="time-filters mx-auto max-w-3xl p-5 flex justify-around mb-4">
          {[9, 29, 59].map((time) => (
            <button
              onClick={()=>{handleTimeFilter(time)}}
              key={time}
              className={`py-2 px-4 rounded-lg ${selectedTime === time ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {time === 9 && '< 10 Minutes'}
              {time === 29 && '< 30 Minutes'}
              {time === 59 && '< 1 hour'}
            </button>
          ))}
        </div>
    
          <div className='flex flex-wrap m-4 sm:m-8 lg:m-12 xl:m-16'>
            {recipeArray.length > 0 ? recipeArray.map((recipe) => (
              <div
                key={recipe.title}
                className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-2 sm:p-4 hover:shadow-lg transition duration-300 rounded-md' // Add rounded-md class for rounded corners
                style={{ marginBottom: '20px' }} // Add margin bottom for spacing
              >
                <RecipeCard name={recipe.title}  image={recipe.image}  link={recipe.link}  time={recipe.time}  missingIngredients={recipe.missingIngredients} missedIngredientCount={recipe.missedIngredientCount} id={recipe.id} usedIngredients={recipe.usedIngredients} />
              </div>
            )) :
            <p>Your Pantry is Empty Select Some Ingredients to Begin</p>
            }
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
