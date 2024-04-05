'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation'; 
import Image from 'next/image';
import StepsCard from '../components/stepscard';
import IngredientCard from '../components/ingredientcard'
import Link from 'next/link';

export default function OneRecipePageCard() {
    const apiKey = process.env.NEXT_PUBLIC_SECRET_API_KEY
    const { id } = useParams()
    const [recipeData, setRecipeData] = useState({
        ingredients: [],
        steps: [],
        missingIngredients : [],
        usedIngredients: [] 
    });
    const [userToken, setUserToken] = useState('')
    const [pantryItems, setPantryItems] = useState([])
    const [contentToShow, setContentToShow] = useState('ingredients')
    const [ingredientsList, setIngredientsList] = useState(() => {
      if (typeof window === 'undefined') {
        return []
    }
      const storedList = sessionStorage.getItem('ingredientsList');
      return storedList ? JSON.parse(storedList) : [];
    })

    useEffect(() => {
      if (typeof window === 'undefined') {
        return []
    }
      sessionStorage.setItem('ingredientsList', JSON.stringify(ingredientsList));
    }, [ingredientsList])

    const missingIngredientsArrayString = localStorage.getItem('missingIngredients');
    const missingIngredientsArray = JSON.parse(missingIngredientsArrayString);
    
    const usedIngredientsArrayString = localStorage.getItem('usedIngredients');
    const usedIngredientsArray = JSON.parse(usedIngredientsArrayString);
    
    


  const arrangedMissingIngredientsArray = missingIngredientsArray.map(result => ({
    'id': result.id,
    'name': result.name
  }));
  const arrangedUsedIngredientsArray = usedIngredientsArray.map(result => ({
    'id': result.id,
    'name': result.name
  }));




    useEffect(() => {
      
      const token = localStorage.getItem('usertoken') || '';
      setUserToken(token);
    }, [])

    const ingredientsArrayToString = () => {
        return recipeData.ingredients?.join(', ');
    };

    useEffect(() => {
        if (id) { 
            fetch(`https://api.spoonacular.com/recipes/${id}/information`, {
                method: 'GET',
                headers: {
                    'x-api-key': apiKey 
                }
            })
            .then(response => response.json())
            .then(data => {
                const stepsArray = data.analyzedInstructions.flatMap(instruction => instruction.steps); 
                const ingredientsArray = data.extendedIngredients.map(result => `${result.amount} ${result.unit} ${result.name}`);
                
                
                setRecipeData({
                    ingredients: ingredientsArray,
                    missingIngredients: arrangedMissingIngredientsArray,
                    usedIngredients: arrangedUsedIngredientsArray,
                    time: data.readyInMinutes,
                    name: data.title,
                    url: data.sourceUrl,
                    image: data.image,
                    steps: stepsArray
                });            
                
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
            });
        }
    }, [id, apiKey, arrangedMissingIngredientsArray, arrangedUsedIngredientsArray]);
    
    const handleTime = () => {
        const time = recipeData.time
        const numTime = Number(time);
    
        if (isNaN(numTime)) {
            console.error('Time is not a valid number:', time);
            return 'Invalid time';
        }
    
        if (numTime < 10) {
            return '< 10 mins';
        } else if (numTime >= 10 && numTime < 60) {
            return `${numTime} minutes`;
        } else {
            const hours = Math.floor(numTime / 60);
            const minutes = numTime % 60;
            
            return `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` and ${minutes} minute${minutes !== 1 ? 's' : ''}` : ''}`;
        }
    }
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
      if (userToken) fetchPantryItems();
    }, [userToken, fetchPantryItems]);
  
    
    
  
    const handleIngredientsListUpdate = async (ingredient) => {
      const index = ingredientsList.findIndex(item => item.name === ingredient.name);
  
      
      let updatedList;
      if (index === -1) {
         
          updatedList = [...ingredientsList, ingredient];
      } else {
          
          updatedList = ingredientsList.filter((_, i) => i !== index);
      }
    
      // Update React state with the new list
      setIngredientsList(updatedList);
    
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
        <div className="bg-white px-8 py-10 md:pl-[105px] pb-[60px] h-screen overflow-y-auto">
          <Link href="/recipes">
            
              <Image src="/arrow.png" alt="Back to Recipes" width={16} height={16} className='mb-5' />
            
          </Link>
    
          <div className="grid grid-cols-2 gap-4 items-center">
            {recipeData.image && (
              <div className="flex justify-start">
                <Image src={recipeData.image} alt={recipeData.name} width={150} height={150} />
              </div>
            )}
    
            <div className="flex flex-col">
              <h2 className="font-dm text-2xl font-bold leading-7" style={{ fontFamily: '"DM Sans", sans-serif', lineHeight: '28px' }}>
                {recipeData.name}
              </h2>
              <div><a href={recipeData.link} className="text-blue-600">Original recipe</a></div>
            </div>
          </div>
    
          <div>Total time: {handleTime()}</div>
    
          <div className="w-full mt-4">
          <div className="grid grid-cols-2 gap-4 mb-2">
  <p
    onClick={() => setContentToShow('ingredients')}
    className={`text-center font-medium text-sm leading-[18.23px] cursor-pointer ${contentToShow === 'ingredients' ? 'text-[#558918] underline' : 'text-gray-800'} style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', letterSpacing: '3%' `} >
    
    Ingredients
  </p>

  <p 
    onClick={() => setContentToShow('instructions')} 
    className={`text-center font-medium text-sm leading-[18.23px] cursor-pointer ${contentToShow === 'instructions' ? 'text-[#558918] underline' : 'text-gray-800'} style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', letterSpacing: '3%'`}>
    Instructions
  </p>
</div>
    
            {contentToShow === 'ingredients' ? (                
            <div>
                <div className='flex w-full items-center gap-2 p-4 rounded-lg'>
  <div className='flex-shrink-0'>
    <Image src="/exclomation.png" alt="Exclamation" width={25} height={25} />
  </div>
  <div 
  className="text-sm font-normal italic" 
  style={{ 
    fontFamily: '"DM Sans", sans-serif', 
    fontSize: '14px', 
    lineHeight: '18.23px', 
    letterSpacing: '-0.01em'  // Approximation of -1% letter-spacing
  }}
>
  We’ve marked any missing ingredients, but make sure to double-check this list for quantities and specific names!
</div>
</div>               
              <IngredientCard 
                ingredientList={recipeData.usedIngredients} 
                updateIngredientsList={handleIngredientsListUpdate} 
                checkCondition={(ingredient) => userToken ? pantryItems.some(item => item.name === ingredient.name) : ingredientsList.some(item => item.name === ingredient.name)}
                missedIngredients={recipeData.missingIngredients}
                IngredientClicked={true}
              />
            </div>
            ) : (
              recipeData.steps.map((step, index) => (
                <StepsCard key={index} step={step} />
              ))
            )}
          </div>
        </div>
      );
    
}