'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation'; 
import Image from 'next/image';
import StepsCard from '../../components/stepscard';
import IngredientCard from '../../components/ingredientcard'

export default function Page() {
    
  
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
    const [ingredientsList, setIngredientsList] = useState(() => {
      const storedList = sessionStorage.getItem('ingredientsList');
      return storedList ? JSON.parse(storedList) : [];
    })

    useEffect(() => {
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
        <div>
            {recipeData.image && <Image src={recipeData.image} alt={recipeData.name} width={100} height={100} />}
            <div>Total time: {handleTime()}</div>
            <div>name: {recipeData.name}</div>
            <div>ingredients: {ingredientsArrayToString()}</div>
            {recipeData.steps.map((step, index) =>
                <StepsCard key={index} step={step} /> 
            )}
            <IngredientCard ingredientList={recipeData.usedIngredients} updateIngredientsList={handleIngredientsListUpdate} checkCondition={(ingredient) => userToken ? pantryItems.some(item => item.name === ingredient.name)  : ingredientsList.some(item => item.name === ingredient.name)} missedIngredients={recipeData.missingIngredients}/>
        </div>
    );
}
