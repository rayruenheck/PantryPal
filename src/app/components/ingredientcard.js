
import './IngredientCard.css';

export default function IngredientCard({ ingredientList , updateIngredientsList, checkCondition }) {
    
    const handleIngredientClick = (ingredient) => {
        updateIngredientsList(ingredient);
      } 
      
    
    return (
        <div className="ingredient-card p-4 rounded-lg flex flex-row flex-wrap gap-4">
      {ingredientList.map((ingredient) => {
        
        const isChecked = checkCondition(ingredient);

        return (
          <div key={ingredient.id} className="ingredient-name flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-100">
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isChecked} 
                onChange={() => handleIngredientClick(ingredient)}
                className="form-checkbox"
              />
              <span className='ml-2'>{ingredient.name}</span>
            </label>
          </div>
        );
      })}
    </div>
    );
}