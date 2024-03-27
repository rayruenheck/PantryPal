
import './IngredientCard.css';

export default function IngredientCard({ ingredientList, updateIngredientsList, checkCondition, missedIngredients }) {
  
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
    <div className="ingredient-card p-4 rounded-lg flex flex-row flex-wrap gap-4">
      {combinedIngredientsList.map(ingredient => (
        <div key={ingredient.id} className="ingredient-name flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-100">
          <label className="flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={checkCondition(ingredient)} // Correct usage of checkCondition
              onChange={() => handleIngredientClick(ingredient)} // Call handleIngredientClick
              className="form-checkbox"
            />
            <span className='ml-2'>{ingredient.name}</span>
          </label>
        </div>
      ))}
    </div>
  );
}