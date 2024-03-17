import Image from 'next/image'
import React from 'react'
import { useRouter } from 'next/navigation'

export default function RecipeCard({name , image , link , time , missingIngredients, id }) {

    const router = useRouter()

    const toSlug = () => {
        console.log(id)
        router.push(`/${name}/${id}`)
      }

    const handleMissingIngredients = () => {
        if(missingIngredients == 0){
            return 'you have all the ingredients'
        }else{
            return `you need ${missingIngredients} more ingredients`
        }
    }
    const handleTime = () => {
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
        <div onClick={toSlug} className='cursor-pointer overflow-hidden shadow-md mx-auto my-4 w-full sm:max-w-sm'>
            <div className='relative w-full' style={{ paddingTop: '0' }}> {/* Maintain aspect ratio for images */}
                <Image 
                  priority 
                  layout='responsive' 
                  objectFit='cover' 
                  alt={name} 
                  src={image} 
                  width={700}  // Provide width and height to maintain aspect ratio
                  height={394}
                />
            </div>
            <div className='flex flex-col p-4 space-y-2'>
                <h2 className='text-lg font-bold text-left'>{name}</h2>
                <div className='text-sm text-gray-700'>{handleMissingIngredients()}</div>
                <div className='flex justify-start items-center'>
                    <div className='rounded-full border border-gray-300 flex items-center justify-center p-2'>
                        <span className='text-sm'>{handleTime()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}