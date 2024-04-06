import Image from "next/image";
export default function IngredientCard({ ingredientList, updateIngredientsList, checkCondition, missedIngredients, IngredientClicked}) {
  
  // Function to handle ingredient click events
  const handleIngredientClick = (ingredient) => {
    
    updateIngredientsList(ingredient);
  };

  // Combine ingredientList with missedIngredients, avoiding duplicates
  const combinedIngredientsList = missedIngredients && missedIngredients.length > 0
    ? [
        ...ingredientList,
        ...missedIngredients.filter(mi => 
          !ingredientList.some(il => il.name === mi.name)
        )
      ]
    : ingredientList;

    return (
      <>
        {!IngredientClicked ? (
          <div className="flex flex-row flex-wrap gap-4">
            {combinedIngredientsList.map((ingredient) => (
              <div 
                key={ingredient.id} 
                className={`flex items-center p-2 border rounded-lg cursor-pointer ${checkCondition(ingredient) ? 'bg-[#FFAA6B]' : ''}`}
                onClick={() => handleIngredientClick(ingredient)}
              >
                <div className="flex items-center cursor-pointer">
                  {checkCondition(ingredient) ? (
                    // Use Next.js Image component or <img> depending on your setup
                    <Image src="/checkmark.png" alt="Checked" width={13} height={10} />
                  ) : (
                    <Image src="/uncheckedbox.png" alt="Unchecked" width={16} height={16} />
                  )}
                  <span className='ml-2 text-center font-medium text-sm leading-[18.23px]' style={{ fontFamily: '"DM Sans", sans-serif', letterSpacing: '3%' }}>
                    {ingredient.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
  <div className="p-4 gap-4">
  {combinedIngredientsList.map((ingredient) => (
    <div 
    key={ingredient.id} 
    className={`ml-2 font-medium text-sm leading-[18.23px] ${checkCondition(ingredient) ? 'text-current' : 'text-[#EB5110]'} cursor-pointer`} 
    style={{ fontFamily: '"DM Sans", sans-serif', letterSpacing: '3%' }}
    onClick={() => handleIngredientClick(ingredient)}
  >
    {ingredient.name}
  </div>
    ))}
</div> 
        )}
      </>
    );
}