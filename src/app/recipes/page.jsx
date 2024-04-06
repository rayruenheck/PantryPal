'use client'
import { useState, useEffect, useCallback } from 'react'
import RecipePageComponent from '../components/recipepagecomponent'
import SideBar from '../components/sidebar';



export default function Page() {
  

    return (
    <div className='h-screen w-full overflow-hidden flex'>
      <RecipePageComponent/>
      <SideBar />
      
    </div>
  );
}

