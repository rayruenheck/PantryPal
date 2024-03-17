'use client'
import { useState, useEffect, useCallback } from 'react'
import RecipeCard from '../components/recipecard'


export default function Page() {
    const apiKey = process.env.NEXT_PUBLIC_SECRET_API_KEY
    const [selectedTime, setSelectedTime] = useState('')
    const [recipe, setRecipe] = useState([])
    const [pantryItems, setPantryItems] = useState([])
    const [ingredientsList, setIngredientsList] = useState([]);
    const [recipesDetails, setRecipesDetails] = useState([])
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
        
        setIngredientsList(currentList.map(item=>item.name));
      }
    }, [userToken, pantryItems])

    const ingredientsListToString = (ingredientsList) => {
      return ingredientsList.join(', ');
    };
  
    useEffect(() => {
      if (ingredientsList.length > 0) {
        fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredientsListToString(ingredientsList)}&number=100&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
          const tempRecipesDetails = data.map(item => ({
            id: item.id,
            missedIngredientsCount: item.missedIngredientCount
          }));
          setRecipesDetails(tempRecipesDetails);
        })
        .catch(error => {
          console.error('Error fetching data: ', error);
        });
      }
    }, [ingredientsList, apiKey]);
  
    useEffect(() => {
      if (recipesDetails.length > 0) {
        const ids = recipesDetails.map(detail => detail.id).join(',');
        fetch(`https://api.spoonacular.com/recipes/informationBulk?ids=${ids}&number=100&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
          const tempRecipeArray = data.map(item => {
            const details = recipesDetails.find(detail => detail.id === item.id) || {};
            return {
              id: item.id,
              title: item.title,
              link: item.sourceUrl,
              image: item.image,
              time: item.readyInMinutes,
              missingIngredients: details.missedIngredientsCount
            };
          });
          setRecipeArray(tempRecipeArray);
        })
        .catch(error => {
          console.error('Error fetching data: ', error);
        });
      }
    }, [recipesDetails, apiKey]);
    const handleTimeFilter = (time) => {
      setSelectedTime(time);
    };
    const filteredRecipes = selectedTime ? recipeArray.filter(recipe => recipe.time <= selectedTime) : recipeArray;


    

  
    return (
      <div className='h-screen w-full bg-gray-100'>
          {/* <div className="search-container mx-auto max-w-3xl p-4">
            <div className="search-box flex items-center border-2 rounded-md border-gray-400 mb-8 bg-white">
              <input
                value={recipe}
                onChange={(e) => setRecipe(e.target.value)}
                className='flex-1 py-2 px-4 md:h-[75px] rounded-md border-none bg-transparent placeholder-gray-400 focus:outline-none'
                type='text'
                name='recipe' 
                placeholder='Search for recipes'
                required
              />
            </div>            
          </div> */}
          <div className="time-filters mx-auto max-w-3xl p-5 flex justify-around mb-4">
          {[9, 29, 59].map((time) => (
            <button
              key={time}
              className={`py-2 px-4 rounded-lg ${selectedTime === time ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              // onClick={() => handleTimeFilter(time)}
            >
              {time === 9 && '< 10 Minutes'}
              {time === 29 && '< 30 Minutes'}
              {time === 59 && '< 1 hour'}
            </button>
          ))}
        </div>
    
          <div className='flex flex-wrap m-4 sm:m-8 lg:m-12 xl:m-16'>
            {recipeArray.map((recipe) => (
              <div
                key={recipe.title}
                className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-2 sm:p-4 hover:shadow-lg transition duration-300 rounded-md' // Add rounded-md class for rounded corners
                style={{ marginBottom: '20px' }} // Add margin bottom for spacing
              >
                <RecipeCard name={recipe.title}  image={recipe.image}  link={recipe.link}  time={recipe.time}  missingIngredients={recipe.missingIngredients} id={recipe.id} />
              </div>
            ))}
          </div>
        </div>
      );
  
}
