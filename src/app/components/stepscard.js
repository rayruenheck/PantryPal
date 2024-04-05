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
    <div className='mb-4'>
    
    <h3 className="font-dm font-bold text-lg leading-[23.44px]" style={{ fontFamily: '"DM Sans", sans-serif', letterSpacing: '-1%' }}>
        Step: {step.number}
    </h3>
    <div className="font-dm font-medium text-base leading-[20.83px]" style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '16px', letterSpacing: '-1%' }}>
        {step.step}
    </div>
    
    </div>
    

  )
}
