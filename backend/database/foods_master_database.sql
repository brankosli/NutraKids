-- ============================================
-- NutraKids Food Database
-- Comprehensive list of foods with emoji and categories
-- This reduces AI API calls by doing local matching first
-- ============================================

-- Create foods_master table (our "cached" database)
CREATE TABLE IF NOT EXISTS foods_master (
    id INT PRIMARY KEY AUTO_INCREMENT,
    food_name VARCHAR(255) NOT NULL UNIQUE,
    emoji VARCHAR(10) NOT NULL,
    category VARCHAR(100) NOT NULL,
    alternative_names TEXT,  -- e.g., "strawberry,strawberries,strawbs"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (food_name),
    INDEX idx_category (category)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- FRUITS (🍎🍌🍇)
-- ============================================
INSERT INTO foods_master (food_name, emoji, category, alternative_names) VALUES
('Apples', '🍎', 'Fruits', 'apple,apples,apple fruit'),
('Bananas', '🍌', 'Fruits', 'banana,bananas'),
('Blueberries', '🫐', 'Fruits', 'blueberry,blueberries,blue berry'),
('Grapes', '🍇', 'Fruits', 'grape,grapes,green grapes,red grapes'),
('Oranges', '🍊', 'Fruits', 'orange,oranges,orange fruit'),
('Strawberries', '🍓', 'Fruits', 'strawberry,strawberries,strawberrys,strawbery'),
('Lemons', '🍋', 'Fruits', 'lemon,lemons,citrus'),
('Watermelon', '🍉', 'Fruits', 'watermelon,water melon,melon'),
('Mangoes', '🥭', 'Fruits', 'mango,mangoes'),
('Peaches', '🍑', 'Fruits', 'peach,peaches'),
('Pineapples', '🍍', 'Fruits', 'pineapple,pineapples,pine apple'),
('Pears', '🍐', 'Fruits', 'pear,pears'),
('Cherries', '🍒', 'Fruits', 'cherry,cherries'),
('Raspberries', '🫐', 'Fruits', 'raspberry,raspberries,rasp berry'),
('Kiwi', '🥝', 'Fruits', 'kiwi,kiwis'),
('Papaya', '🧡', 'Fruits', 'papaya,papayas'),
('Coconut', '🥥', 'Fruits', 'coconut,coconuts,coco nut'),
('Avocado', '🥑', 'Fruits', 'avocado,avocados'),
('Tangerine', '🍊', 'Fruits', 'tangerine,tangerines,mandarin'),
('Blackberries', '🫐', 'Fruits', 'blackberry,blackberries,black berry'),

-- ============================================
-- VEGETABLES (🥦🥕🍅)
-- ============================================
('Broccoli', '🥦', 'Vegetables', 'broccoli,brocoli,broccolini'),
('Carrots', '🥕', 'Vegetables', 'carrot,carrots,carrot vegetable'),
('Tomatoes', '🍅', 'Vegetables', 'tomato,tomatoes,tomatos'),
('Lettuce', '🥬', 'Vegetables', 'lettuce,letuce,iceberg lettuce'),
('Spinach', '🥬', 'Vegetables', 'spinach,spinache'),
('Cucumber', '🥒', 'Vegetables', 'cucumber,cucumbers,cukes'),
('Pepper', '🌶️', 'Vegetables', 'pepper,peppers,red pepper,bell pepper'),
('Celery', '🥒', 'Vegetables', 'celery,celerey,celary'),
('Corn', '🌽', 'Vegetables', 'corn,corn kernel,maize'),
('Peas', '🟢', 'Vegetables', 'pea,peas,green peas'),
('Cabbage', '🥬', 'Vegetables', 'cabbage,cabbages'),
('Onion', '🧅', 'Vegetables', 'onion,onions,onyon'),
('Garlic', '🧄', 'Vegetables', 'garlic,garlic clove,garlics'),
('Cauliflower', '🥦', 'Vegetables', 'cauliflower,cauli,cauliflower'),
('Zucchini', '🍆', 'Vegetables', 'zucchini,courgette,zuchinni'),
('Eggplant', '🍆', 'Vegetables', 'eggplant,aubergine,eggplants'),
('Asparagus', '🌱', 'Vegetables', 'asparagus,asparagus tips'),
('Brussels Sprouts', '🥬', 'Vegetables', 'brussels sprout,brussels sprouts,brussel sprout'),
('Beets', '🔴', 'Vegetables', 'beet,beets,beetroot'),
('Radish', '🔴', 'Vegetables', 'radish,radishes,radice'),

-- ============================================
-- PROTEINS (🍗🥚🍖)
-- ============================================
('Chicken', '🍗', 'Protein', 'chicken,chiken,chicken breast,chicken wing'),
('Beef', '🥩', 'Protein', 'beef,cow meat,steak'),
('Pork', '🥓', 'Protein', 'pork,pork chop,pork meat'),
('Fish', '🐟', 'Protein', 'fish,salmon,cod,tilapia'),
('Salmon', '🐟', 'Protein', 'salmon,salmon fish'),
('Tuna', '🐟', 'Protein', 'tuna,tuna fish'),
('Eggs', '🥚', 'Protein', 'egg,eggs,chicken egg'),
('Turkey', '🦃', 'Protein', 'turkey,turkey meat'),
('Shrimp', '🦐', 'Protein', 'shrimp,prawns,shrimps'),
('Crab', '🦀', 'Protein', 'crab,crabs,crab meat'),
('Lobster', '🦞', 'Protein', 'lobster,lobsters'),
('Lamb', '🐑', 'Protein', 'lamb,lamb meat'),
('Tofu', '⬜', 'Protein', 'tofu,bean curd'),
('Tempeh', '⬜', 'Protein', 'tempeh,temp'),
('Seitan', '⬜', 'Protein', 'seitan,wheat meat'),

-- ============================================
-- DAIRY (🧀🥛🥣)
-- ============================================
('Cheese', '🧀', 'Dairy', 'cheese,cheddar,mozzarella,swiss'),
('Milk', '🥛', 'Dairy', 'milk,cow milk,whole milk'),
('Yogurt', '🥛', 'Dairy', 'yogurt,yoghurt,yogurt'),
('Butter', '🧈', 'Dairy', 'butter,butters'),
('Ice Cream', '🍦', 'Dairy', 'ice cream,icecream,ice-cream'),
('Cream', '🥛', 'Dairy', 'cream,sour cream,heavy cream'),
('Cottage Cheese', '🧈', 'Dairy', 'cottage cheese,curd'),
('Mozzarella', '🧀', 'Dairy', 'mozzarella,mozarella,mozz'),
('Cheddar', '🧀', 'Dairy', 'cheddar,cheddar cheese'),
('Greek Yogurt', '🥛', 'Dairy', 'greek yogurt,greek yoghurt'),

-- ============================================
-- GRAINS (🍞🍚🌾)
-- ============================================
('Bread', '🍞', 'Grains', 'bread,white bread,wheat bread'),
('Rice', '🍚', 'Grains', 'rice,white rice,brown rice,basmati'),
('Pasta', '🍝', 'Grains', 'pasta,spaghetti,penne,macaroni'),
('Cereal', '🥣', 'Grains', 'cereal,breakfast cereal'),
('Oats', '🌾', 'Grains', 'oat,oats,oatmeal'),
('Whole Wheat', '🌾', 'Grains', 'whole wheat,whole grain,wholegrain'),
('Quinoa', '🌾', 'Grains', 'quinoa,kinwa'),
('Barley', '🌾', 'Grains', 'barley,pearl barley'),
('Couscous', '🌾', 'Grains', 'couscous,cous cous'),
('Popcorn', '🍿', 'Grains', 'popcorn,pop corn'),

-- ============================================
-- PREPARED MEALS (🍕🍔🌮)
-- ============================================
('Pizza', '🍕', 'Prepared Meals', 'pizza,pizzas,pepperoni pizza'),
('Hamburger', '🍔', 'Prepared Meals', 'hamburger,burger,hamburgers'),
('Hot Dog', '🌭', 'Prepared Meals', 'hot dog,hotdog,hot-dog'),
('Sandwich', '🥪', 'Prepared Meals', 'sandwich,sandwiches,turkey sandwich'),
('Tacos', '🌮', 'Prepared Meals', 'taco,tacos,taco meat'),
('Burrito', '🌯', 'Prepared Meals', 'burrito,burritos,burrito wrap'),
('Chicken Nuggets', '🍗', 'Prepared Meals', 'chicken nugget,chicken nuggets,nuggets'),
('French Fries', '🍟', 'Prepared Meals', 'french fry,french fries,fries,chips'),
('Soup', '🍲', 'Prepared Meals', 'soup,chicken soup,tomato soup'),
('Salad', '🥗', 'Prepared Meals', 'salad,garden salad,caesar salad'),
('Pasta Sauce', '🍝', 'Prepared Meals', 'pasta sauce,marinara,spaghetti sauce'),
('Lasagna', '🍝', 'Prepared Meals', 'lasagna,lasagne'),
('Stir Fry', '🍳', 'Prepared Meals', 'stir fry,stirfry,stir-fry'),
('Curry', '🍛', 'Prepared Meals', 'curry,chicken curry,vegetable curry'),
('Rice Bowl', '🍚', 'Prepared Meals', 'rice bowl,bowl,rice'),

-- ============================================
-- SNACKS & TREATS (🍪🍩🍫)
-- ============================================
('Chocolate', '🍫', 'Snacks', 'chocolate,dark chocolate,milk chocolate'),
('Cookies', '🍪', 'Snacks', 'cookie,cookies,biscuit'),
('Donuts', '🍩', 'Snacks', 'donut,donuts,doughnut'),
('Chips', '🥔', 'Snacks', 'chip,chips,potato chips'),
('Crackers', '🍘', 'Snacks', 'cracker,crackers'),
('Nuts', '🥜', 'Snacks', 'nut,nuts,almonds,peanuts'),
('Peanut Butter', '🥜', 'Snacks', 'peanut butter,peanut buttr,pb'),
('Granola Bar', '📦', 'Snacks', 'granola bar,granola'),
('Popcorn', '🍿', 'Snacks', 'popcorn,pop corn'),
('Trail Mix', '🥜', 'Snacks', 'trail mix,mix nuts'),
('Candy', '🍬', 'Snacks', 'candy,candies,sweet'),
('Gummy Bears', '🍬', 'Snacks', 'gummy bear,gummy bears,gummies'),
('Pretzels', '🥨', 'Snacks', 'pretzel,pretzels'),
('Dried Fruit', '🌰', 'Snacks', 'dried fruit,raisins,dried apple'),
('Honey', '🍯', 'Snacks', 'honey,raw honey'),

-- ============================================
-- BEVERAGES (🥤🧃🧋)
-- ============================================
('Water', '💧', 'Beverages', 'water,drinking water,tap water'),
('Milk', '🥛', 'Beverages', 'milk,cow milk,whole milk'),
('Orange Juice', '🍊', 'Beverages', 'orange juice,oj,orange juice'),
('Apple Juice', '🍎', 'Beverages', 'apple juice,apple cider'),
('Juice', '🧃', 'Beverages', 'juice,fruit juice,juices'),
('Smoothie', '🧃', 'Beverages', 'smoothie,fruit smoothie,smoothies'),
('Soda', '🥤', 'Beverages', 'soda,cola,soft drink'),
('Tea', '🫖', 'Beverages', 'tea,green tea,black tea'),
('Coffee', '☕', 'Beverages', 'coffee,espresso,cappuccino'),
('Hot Chocolate', '🍫', 'Beverages', 'hot chocolate,hot cocoa,chocolate milk'),
('Lemonade', '🍋', 'Beverages', 'lemonade,fresh lemonade'),
('Smoothie Bowl', '🥣', 'Beverages', 'smoothie bowl,acai bowl');

-- ============================================
-- Verify insert
-- ============================================
SELECT COUNT(*) as total_foods FROM foods_master;
SELECT * FROM foods_master ORDER BY category, food_name LIMIT 20;
