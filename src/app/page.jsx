'use client'
import Link from "next/link"
import SideBar from "./components/sidebar"
import Image from 'next/image'


export default function Home() {
  return (
    <>
  <SideBar/>
  <div className="bg-white px-4 py-8 md:px-8 md:py-10 md:pl-[68px] lg:pl-[137px] h-screen overflow-hidden">
    
    <div className="flex flex-col justify-center items-center h-full">
      <div className="hidden lg:flex lg:justify-center mb-4">
        <Image src="/illustration.png" alt="Illustrations" width={150} height={150} />
      </div>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#67A320] text-center mb-6 lg:pb-4">Welcome to <br/>Pantry Pal</h1>
      <p className="text-center text-sm md:text-base lg:text-lg text-gray-700 px-2 mb-4">
        We know you’re hungry! Let us know what ingredients you have at home and we’ll help you find quick & easy recipes.
      </p>
      
      <div className="flex flex-col items-center w-full px-4">
        <Link href="/register" legacyBehavior>
          <a className="w-4/5 md:w-2/5 lg:w-1/5 bg-[#67A320] text-white text-center py-2 rounded-lg mb-2 transition duration-300 ease-in-out hover:bg-green-600">
            Create account
          </a>
        </Link>
        <div className="text-center text-xs md:text-sm text-gray-600 mb-2">Already have an account? <Link href="/login" legacyBehavior><a className="text-orange-500">Log in</a></Link></div>
        <div className="hidden lg:flex lg:justify-center mb-2">
          <Image src="/fork.png" alt="Fork" width={150} height={40} />
        </div>
        <div className="text-center text-xs md:text-sm text-gray-600 my-2">OR</div>
        <Link href="/pantry" legacyBehavior>
          <a className="w-4/5 md:w-2/5 lg:w-1/5 bg-white text-[#558918] border-[#558918] border text-center py-2 rounded-lg transition duration-300 ease-in-out hover:bg-green-600 hover:text-white">
            Continue as guest
          </a>
        </Link>
        <p className="mt-2 text-center text-xs text-gray-500 px-2">
          You won&apost be able to save your pantry items for return visits without an account.
        </p>
      </div>
    </div>
    
  </div>
</>

  )
}
  

