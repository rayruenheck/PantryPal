'use client'
import SideBar from '../../components/sidebar';
import OneRecipePageCard from '../../components/onerecipepagecard'

export default function Page() {
    
  

    return (

    <div className='h-screen w-full overflow-hidden flex'>
      <SideBar/>
      <OneRecipePageCard/>
    </div>
    );
}
