import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { fetchDrinksById, fetchMealsById } from '../services/fetch';
import '../style/RecipeInProgress.css';

function RecipeInProgress({ match, history }) {
  const [recipeDetails, setRecipeDetails] = useState([]);
  const [ingredientList, setIngredientList] = useState(null);
  const [ingredientCheck, setIngredientCheck] = useState([]);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const recipeId = match.params.id;
  const { pathname } = history.location;
  const mealOrDrink = pathname.includes('meal') ? 'meals' : 'drinks';
  const checkerLocalStorage = JSON.parse(localStorage.getItem('checkerList'));

  const fetcher = async () => {
    const currentMealOrDrink = mealOrDrink === 'meals'
      ? await fetchMealsById(recipeId)
      : await fetchDrinksById(recipeId);
    setCurrentRecipe(currentMealOrDrink);
    const currentIngredientEntries = Object.entries(currentMealOrDrink);
    const currentIngredientList = currentIngredientEntries
      .filter((e) => e[0].includes('Ingredient') && e[1].length > 0)
      .map((e) => e[1]);
    setIngredientList(currentIngredientList);
    if (!checkerLocalStorage) {
      const checkerArr = new Array(currentIngredientList.length).fill('not-done');
      setIngredientCheck(checkerArr);
      const firstAcessChecker = { meals: {}, drinks: {} };
      localStorage.setItem('checkerList', JSON.stringify(firstAcessChecker));
    } else if (checkerLocalStorage[mealOrDrink][recipeId] === undefined) {
      const checkerArr = new Array(currentIngredientList.length).fill('not-done');
      const newLocal = { ...checkerLocalStorage,
        [mealOrDrink]: { ...checkerLocalStorage.meals, [recipeId]: checkerArr } };
      localStorage.setItem('checkerList', JSON.stringify(newLocal));
      setIngredientCheck(checkerArr);
    } else {
      setIngredientCheck(checkerLocalStorage[mealOrDrink][recipeId]);
    }

    const details = pathname.includes('meals')
      ? (
        <div>
          <h3 data-testid="recipe-title">
            { currentMealOrDrink.strMeals }
          </h3>
          <p data-testid="recipe-category">
            { currentMealOrDrink.strCategory }
          </p>
          <img
            src={ currentMealOrDrink.strMealThumb }
            alt={ currentMealOrDrink.strMeals }
            data-testid="recipe-photo"
          />
          <p data-testid="instructions">
            { currentMealOrDrink.strInstructions }
          </p>
        </div>)
      : (
        <div>
          <h3 data-testid="recipe-title">
            { currentMealOrDrink.strDrink }
          </h3>
          <p data-testid="recipe-category">
            { currentMealOrDrink.strAlcoholic }
          </p>
          <img
            src={ currentMealOrDrink.strDrinkThumb }
            alt={ currentMealOrDrink.strDrink }
            data-testid="recipe-photo"
          />
          <p data-testid="instructions">
            { currentMealOrDrink.strInstructions }
          </p>
        </div>);
    setRecipeDetails(details);
  };

  useEffect(() => {
    fetcher();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFinishRecipe = () => {
    const localFinished = JSON.parse(localStorage.getItem('doneRecipes'));
    const infoForFinished = {
      id: recipeId,
      type: mealOrDrink,
      nationality: currentRecipe.strArea,
      category: currentRecipe.strCategory,
      alcoholicOrNot: mealOrDrink === 'drink' ? currentRecipe.strAlcoholic : '',
      name: mealOrDrink === 'drink' ? currentRecipe.strDrink : currentRecipe.strMeal,
      image: mealOrDrink === 'drink'
        ? currentRecipe.strDrinkThumb : currentRecipe.strMealThumb,
      doneDate: '',
      tags: currentRecipe.strTags,
    };
    if (!localFinished) {
      localStorage.setItem('doneRecipes', JSON.stringify(infoForFinished));
    } else {
      localStorage.setItem(
        'doneRecipes',
        JSON.stringify(...localFinished, infoForFinished),
      );
    }
    history.push('/done-recipes');
  };

  const handleCheckedItem = (index) => {
    const newChecker = ingredientCheck.slice();
    if (newChecker[index] === 'not-done') {
      newChecker.splice(index, 1, 'done');
    } else {
      newChecker.splice(index, 1, 'not-done');
    }
    const newLocal = { ...checkerLocalStorage,
      [mealOrDrink]: { ...checkerLocalStorage.meals, [recipeId]: newChecker } };
    localStorage.setItem('checkerList', JSON.stringify(newLocal));
    setIngredientCheck(newChecker);
  };

  return (
    <div>
      <h1>RecipeInProgress</h1>
      { recipeDetails }
      <button type="button" data-testid="share-btn">Compartilhar</button>
      <button type="button" data-testid="favorite-btn">Favoritar</button>
      { ingredientList
      && (
        <ul>
          { ingredientList.map((e, index) => (
            <li key={ index }>
              <label
                htmlFor={ `input${index}` }
                data-testid={ `${index}-ingredient-step` }
                className={ ingredientCheck[index] }
              >
                <span>{ e }</span>
                <input
                  type="checkbox"
                  name={ `input${index}` }
                  id={ `input${index}` }
                  onChange={ () => handleCheckedItem(index) }
                  checked={ ingredientCheck[index] === 'done' }
                />
              </label>
            </li>)) }
        </ul>)}
      <button
        type="button"
        data-testid="finish-recipe-btn"
        onClick={ handleFinishRecipe }
        disabled={ !ingredientCheck.every((e) => e === 'done') }
      >
        Finalizar receita
      </button>
    </div>
  );
}

RecipeInProgress.propTypes = {
  history: PropTypes.shape({
    location: PropTypes.shape({
      pathname: PropTypes.string,
    }),
    push: PropTypes.func,
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }).isRequired,
};

export default RecipeInProgress;
