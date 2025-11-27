const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const UserTDEE = require('../models/UserTDEE');
const { authenticateToken } = require('./auth');

// Calculate target calories based on TDEE and goal
function calculateTargetCalories(tdee, goal) {
  if (goal === 'weight-loss') {
    return Math.round(tdee - 500); // 500 calorie deficit for ~1 lb/week loss
  } else if (goal === 'muscle-gain') {
    return Math.round(tdee + 300); // 300 calorie surplus for muscle growth
  }
  return tdee; // maintenance
}

// Distribute daily calories across meals
function getTargetCaloriesPerMeal(targetCalories) {
  return {
    breakfast: Math.round(targetCalories * 0.30), // 30%
    lunch: Math.round(targetCalories * 0.35),     // 35%
    dinner: Math.round(targetCalories * 0.30),    // 30%
    snack: Math.round(targetCalories * 0.05)      // 5%
  };
}

// Find best recipe match for target calories
function findBestRecipeMatch(recipes, targetCalories, tolerance = 0.15) {
  if (recipes.length === 0) return null;

  // Sort by how close the calories are to the target
  const sorted = recipes.map(recipe => ({
    recipe,
    difference: Math.abs(recipe.calories - targetCalories)
  })).sort((a, b) => a.difference - b.difference);

  // Return the closest match within tolerance
  const best = sorted[0];
  const maxDifference = targetCalories * tolerance;

  if (best.difference <= maxDifference) {
    return best.recipe;
  }

  // If no perfect match, return the closest one anyway
  return best.recipe;
}

// Calculate nutritional totals for a day
function calculateDayTotals(dayPlan) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;

  for (const mealType in dayPlan.meals) {
    const meal = dayPlan.meals[mealType];
    if (meal) {
      totalCalories += meal.calories || 0;
      totalProtein += meal.protein || 0;
      totalCarbs += meal.carbs || 0;
      totalFats += meal.fats || 0;
    }
  }

  return {
    totalCalories: Math.round(totalCalories),
    totalProtein: Math.round(totalProtein),
    totalCarbs: Math.round(totalCarbs),
    totalFats: Math.round(totalFats)
  };
}

// Generate meal plan based on TDEE and preferences
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { dietType, goal, days = 7 } = req.body;
    const userId = req.userId;

    // Fetch user's TDEE data
    const userTDEE = await UserTDEE.findOne({ userId });

    if (!userTDEE) {
      return res.status(404).json({
        error: 'TDEE data not found. Please calculate your TDEE first using the Buono Bot.'
      });
    }

    // Calculate target calories based on TDEE and goal
    const targetCalories = calculateTargetCalories(userTDEE.calculatedTDEE, goal);
    const mealTargets = getTargetCaloriesPerMeal(targetCalories);

    // Build filter for recipes
    let filter = {};
    if (dietType) {
      filter.dietType = dietType; // 'veg' or 'non-veg'
    }
    if (goal) {
      filter.goal = goal; // 'muscle-gain' or 'weight-loss'
    }

    const recipes = await Recipe.find(filter);

    if (recipes.length === 0) {
      return res.status(404).json({
        error: 'No recipes found matching your preferences. Please try different filters.'
      });
    }

    // Group recipes by meal type
    const groupedRecipes = {
      breakfast: recipes.filter(recipe => recipe.mealType === 'breakfast'),
      lunch: recipes.filter(recipe => recipe.mealType === 'lunch'),
      dinner: recipes.filter(recipe => recipe.mealType === 'dinner'),
      snack: recipes.filter(recipe => recipe.mealType === 'snack')
    };

    // Generate meal plan for specified number of days
    const mealPlan = [];
    const usedRecipes = { breakfast: [], lunch: [], dinner: [], snack: [] };

    for (let day = 0; day < days; day++) {
      const dayPlan = {
        day: day + 1,
        meals: {},
        targetCalories: targetCalories
      };

      // Select best recipe for each meal type based on calorie targets
      for (const mealType in groupedRecipes) {
        if (groupedRecipes[mealType].length > 0) {
          const targetCals = mealTargets[mealType];

          // Filter out recently used recipes for variety (if enough recipes available)
          let availableRecipes = groupedRecipes[mealType];
          if (availableRecipes.length > 3) {
            availableRecipes = availableRecipes.filter(
              recipe => !usedRecipes[mealType].includes(recipe._id.toString())
            );

            // If we've used all recipes, reset the used list
            if (availableRecipes.length === 0) {
              availableRecipes = groupedRecipes[mealType];
              usedRecipes[mealType] = [];
            }
          }

          // Find the best calorie match
          const selectedRecipe = findBestRecipeMatch(availableRecipes, targetCals);

          if (selectedRecipe) {
            dayPlan.meals[mealType] = selectedRecipe;
            usedRecipes[mealType].push(selectedRecipe._id.toString());
          }
        }
      }

      // Calculate totals for the day
      dayPlan.totals = calculateDayTotals(dayPlan);

      mealPlan.push(dayPlan);
    }

    // Calculate average daily totals across all days
    const avgTotals = {
      avgCalories: Math.round(mealPlan.reduce((sum, day) => sum + day.totals.totalCalories, 0) / days),
      avgProtein: Math.round(mealPlan.reduce((sum, day) => sum + day.totals.totalProtein, 0) / days),
      avgCarbs: Math.round(mealPlan.reduce((sum, day) => sum + day.totals.totalCarbs, 0) / days),
      avgFats: Math.round(mealPlan.reduce((sum, day) => sum + day.totals.totalFats, 0) / days)
    };

    res.json({
      mealPlan,
      summary: {
        baseTDEE: userTDEE.calculatedTDEE,
        targetCalories: targetCalories,
        goal: goal,
        dietType: dietType,
        days: days,
        averageDailyTotals: avgTotals
      }
    });
  } catch (err) {
    console.error('Generate meal plan error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;