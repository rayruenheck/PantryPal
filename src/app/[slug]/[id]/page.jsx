'use client'
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; 
import Image from 'next/image';
import StepsCard from '../../components/stepscard';

export default function Page() {
    const apiKey = process.env.NEXT_PUBLIC_SECRET_API_KEY
    const { id } = useParams()
    const [recipeData, setRecipeData] = useState({
        ingredients: [],
        steps: [], 
    });

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
    }, [id, apiKey]);
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

    return (
        <div>
            {recipeData.image && <Image src={recipeData.image} alt={recipeData.name} width={100} height={100} />}
            <div>Total time: {handleTime()}</div>
            <div>name: {recipeData.name}</div>
            <div>ingredients: {ingredientsArrayToString()}</div>
            {recipeData.steps.map((step, index) =>
                <StepsCard key={index} step={step} /> 
            )}
        </div>
    );
}
