import React from 'react'

export default function DisplayPantry() {
    const userToken = getUserToken();

    function getUserToken() {      
      if (typeof window !== 'undefined') {
        
        return localStorage.getItem('usertoken') || ''
      }      
        ;
      }

      const getFavoriteItems = async () => {
        try {
          const response = await fetch('https://raysflaskeccomerce.onrender.com/get-favorite', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
    
          if (response.ok) {
            const data = await response.json();
            setFavoriteItems(data);
          } else {
            console.error('Failed to fetch favorite items');
          }
        } catch (error) {
          console.error('An error occurred:', error);
        }
      };
    
      const updateFavoriteItems = (IngredientId) => {
        setFavoriteItems((prevFavoriteItems) => prevFavoriteItems.filter((item) => item.id !== itemId));
      };
    
      useEffect(() => {
        getFavoriteItems();
      }, [])
  return (
    <div>D</div>
  )
}
