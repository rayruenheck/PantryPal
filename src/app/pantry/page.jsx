'use client';
import PantryPageComponent from '../components/pantrypagecomponent'
import SideBar from '../components/sidebar';
import Image from 'next/image';

export default function Page() {
  


 

  return (
    <div className='h-screen w-full overflow-hidden flex'>
      <SideBar />
      <div className="flex-1 flex">
        {/* PantryPageComponent taking up 1/3 of the space on large screens */}
        <div className="flex-1 lg:w-1/3">
          <PantryPageComponent />
        </div>

        {/* Container for the image and random food fact taking up 2/3 of the space on large screens */}
        <div className="hidden lg:flex lg:w-2/3 flex-col items-center justify-center">
          <Image src="/cup.png" alt="Cup" width={200} height={200} />
          <p className="text-center mt-4">
            {/* Your random food fact here */}
            A random food fact.
          </p>
        </div>
      </div>
    </div>
  )

}  