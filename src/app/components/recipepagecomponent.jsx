import { useState, useEffect, useCallback } from 'react'
import RecipeCard from '../components/recipecard'

export default function RecipePageComponent() {
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
        <div className='h-screen px-8 py-10 bg-white-100 md:pl-[105px] pb-[60px] overflow-y-auto '>
            <div className=" max-w-3xl p-5 flex  mb-4 text-4xl font-bold text-gray-900" style={{fontFeatureSettings: "'ss02' on"}}>
  Suggested Recipes
</div>

    <div className="max-w-3xl p-5 flex mb-4">
        {[9, 29, 59].map((time) => (
          <button
          onClick={() => { handleTimeFilter(time); }}
          key={time}
          className={`py-2 px-4 rounded-lg ${selectedTime === time ? 'bg-[#D7F1C7] text-black' : 'bg-white text-gray-700 border'} ${time !== 9 ? 'ml-4' : ''}`}
        >
          {time === 9 ? '< 10 Minutes' : time === 29 ? '< 30 Minutes' : '< 1 hour'}
        </button>
        ))}
    </div>

    <div className='px-4 py-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
    {recipeArray.length > 0 ? recipeArray.map((recipe) => (
        <div key={recipe.id} className='bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300'>
            <RecipeCard
                name={recipe.title}
                image={recipe.image}
                link={recipe.link}
                time={recipe.time}
                missingIngredients={recipe.missingIngredients}
                missedIngredientCount={recipe.missedIngredientCount}
                usedIngredients={recipe.usedIngredients}
                id={recipe.id}
            />
        </div>
    )) : (
        <p className='text-center w-full'>Your Pantry is Empty. Select Some Ingredients to Begin.</p>
    )}
</div>
</div>
  
    );
}
