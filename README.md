# Ethiopian Buono

A full-stack meal planning and nutrition management application featuring Ethiopian cuisine, with personalized TDEE calculations and goal-based meal recommendations.

## Overview

Ethiopian Buono helps users achieve their fitness goals through personalized meal planning based on Ethiopian recipes. The application calculates your Total Daily Energy Expenditure (TDEE) and generates customized meal plans tailored to your dietary preferences and fitness objectives.

## Features

### Core Functionality

- **User Authentication**
  - Secure JWT-based authentication
  - Sign up and sign in functionality
  - Session persistence with 7-day token expiration

- **HappyFit Bot (TDEE Calculator)**
  - Interactive chatbot interface for collecting health metrics
  - Calculates Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
  - Computes Total Daily Energy Expenditure (TDEE) based on activity level
  - Supports 5 activity levels: Sedentary, Light, Moderate, Active, Very Active

- **Personalized Meal Planning**
  - 7+ day meal plan generation
  - Filter by diet type (Vegetarian/Non-Vegetarian)
  - Filter by fitness goal (Muscle Gain/Weight Loss)
  - Automatic calorie distribution: Breakfast (30%), Lunch (35%), Dinner (30%), Snack (5%)
  - Dynamic calorie targets:
    - Weight Loss: TDEE - 500 calories
    - Muscle Gain: TDEE + 300 calories

- **Shopping List Generation**
  - Auto-generated from meal plans
  - Categorized ingredients (Vegetables, Proteins, Spices, Legumes, Grains, Dairy, Other)
  - Interactive checkbox functionality for tracking purchases

- **Recipe Database**
  - Comprehensive Ethiopian recipe collection
  - Detailed nutritional information (Calories, Protein, Carbs, Fats)
  - Preparation details (Prep time, Cook time, Servings)
  - Recipe images

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js v5.1.0
- **Database**: MongoDB (Mongoose ODM v8.19.3)
- **Authentication**:
  - bcryptjs v3.0.3 (Password hashing)
  - jsonwebtoken v9.0.2 (JWT tokens)
- **Other**: cors v2.8.5, dotenv v17.2.3

### Frontend
- **Framework**: React v19.2.0
- **UI Library**: React-Bootstrap v2.10.10 + Bootstrap v5.3.8
- **Routing**: React Router DOM v7.9.5
- **HTTP Client**: Axios v1.13.2
- **Build Tool**: Create React App

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or remote instance)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ethopian_buono
   ```

2. **Backend Setup**
   ```bash
   cd ethopian_buono/backend
   npm install
   ```

3. **Configure Environment Variables**

   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ethiopian_buono
   JWT_SECRET=your_secret_key_here
   ```

4. **Seed the Database (Optional)**
   ```bash
   node seed.js
   ```

5. **Start Backend Server**
   ```bash
   node server.js
   ```
   Server will run on `http://localhost:5000`

6. **Frontend Setup**

   Open a new terminal:
   ```bash
   cd ethopian_buono/frontend
   npm install
   ```

7. **Start Frontend Development Server**
   ```bash
   npm start
   ```
   Application will open on `http://localhost:3000`

## Usage

### Getting Started

1. **Sign Up**: Create a new account with username, email, and password
2. **HappyFit Bot**: Complete the interactive questionnaire to calculate your TDEE
   - Provide: Age, Height (cm), Weight (kg), Gender, Activity Level
3. **Meal Planner**:
   - Select your diet type (Vegetarian/Non-Vegetarian)
   - Choose your fitness goal (Muscle Gain/Weight Loss)
   - Generate personalized meal plans
4. **Shopping List**: Generate and track your shopping items from meal plans

### TDEE Calculation

The application uses the Mifflin-St Jeor Equation:

**For Males:**
```
BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5
```

**For Females:**
```
BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) - 161
```

**TDEE:**
```
TDEE = BMR × Activity Multiplier
```

Activity Multipliers:
- Sedentary: 1.2
- Lightly Active: 1.375
- Moderately Active: 1.55
- Very Active: 1.725
- Extra Active: 1.9

## Project Structure

```
ethopian_buono/
├── ethopian_buono/
│   ├── backend/
│   │   ├── models/
│   │   │   ├── Recipe.js           # Recipe schema
│   │   │   ├── User.js             # User authentication schema
│   │   │   ├── UserTDEE.js         # TDEE data schema
│   │   │   └── ShoppingList.js     # Shopping list schema
│   │   ├── routes/
│   │   │   ├── auth.js             # Authentication endpoints
│   │   │   ├── tdee.js             # TDEE calculation endpoints
│   │   │   ├── recipes.js          # Recipe endpoints
│   │   │   ├── mealPlans.js        # Meal plan generation
│   │   │   └── shoppingList.js     # Shopping list endpoints
│   │   ├── server.js               # Express server
│   │   └── package.json
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Auth.js         # Login/Signup component
│   │   │   │   ├── HappyFitBot.js  # TDEE calculator chatbot
│   │   │   │   ├── MealPlanner.js  # Meal planning interface
│   │   │   │   └── ShoppingList.js # Shopping list viewer
│   │   │   ├── context/
│   │   │   │   └── AuthContext.js  # Global auth state
│   │   │   ├── App.js              # Main app with routing
│   │   │   └── index.js
│   │   ├── public/
│   │   │   └── images/             # Recipe images
│   │   └── package.json
│   └── Utility Scripts/
│       ├── seed.js                 # Database seeding
│       ├── check-images.js         # Image validation
│       ├── fix-images.js           # Image path correction
│       ├── fix-ingredients.js      # Ingredient normalization
│       ├── fix-recipes.js          # Recipe data correction
│       └── match-images.js         # Image-recipe mapping
└── README.md
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Create new user account
- `POST /auth/signin` - User login

### TDEE
- `POST /tdee/save` - Save user TDEE data
- `GET /tdee/details` - Get user TDEE details
- `POST /tdee/calculate` - Calculate TDEE

### Recipes
- `GET /recipes` - Get all recipes
- `GET /recipes/filter` - Filter by diet type and goal

### Meal Plans
- `POST /mealPlans/generate` - Generate personalized meal plan

### Shopping List
- `POST /shoppingList/generate` - Generate shopping list from meal plan
- `GET /shoppingList` - Get user's shopping list

## Database Models

### User
- username (String, required, unique)
- email (String, required, unique)
- password (String, required, hashed)

### UserTDEE
- userId (ObjectId, reference to User)
- age, height, weight, gender, activityLevel
- bmr, tdee (Number)

### Recipe
- name, description, ingredients, instructions
- nutritionalInfo (calories, protein, carbs, fats)
- mealType, dietType, goal
- prepTime, cookTime, servings
- image

### ShoppingList
- userId (ObjectId)
- ingredients (categorized array)
- mealPlanData

## Utility Scripts

The project includes several utility scripts for database management:

- **seed.js**: Populate database with initial recipe data
- **check-images.js**: Validate recipe image completeness
- **fix-images.js**: Update recipe image paths
- **fix-ingredients.js**: Normalize ingredient data
- **fix-recipes.js**: Correct recipe data inconsistencies
- **match-images.js**: Map images to recipes

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Ethiopian cuisine recipes and nutritional data
- Mifflin-St Jeor Equation for BMR calculation
- React and Express communities for excellent documentation

## Support

For issues, questions, or suggestions, please open an issue in the repository.

---

