import Image from 'next/image'
import React from 'react'

export default function StepsCard( {step}) {
    const ingredientsUsed = step.ingredients.map(ingredient => ingredient.name)
    const ingredientsUsedString = () =>{
        return ingredientsUsed.join(', ')
    }
    const handleTime = () => {
        if(step.length){
        const time = step.length.number
        const numTime = Number(time);
    
        if (isNaN(numTime)) {
            console.error('Time is not a valid number:', time);
            return 'Invalid time';
        }
    
        if (numTime < 60) {
            return `${numTime} minutes`;
        } else {
            const hours = Math.floor(numTime / 60);
            const minutes = numTime % 60;
            
            return `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` and ${minutes} minute${minutes !== 1 ? 's' : ''}` : ''}`;
        }
        }else{
            return ''
        }
    }

  return (
    <div>
    
    <div>step: {step.number}</div>
    <div> {step.step} </div>
    <div>{ingredientsUsedString()}</div>
    <div>{handleTime()}</div>
    </div>
    

  )
}
