import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import Product from './models/Product.js';

dotenv.config();

const categoriesData = [
    { name: 'Fruits & Vegetables' },
    { name: 'Dairy & Bakery' },
    { name: 'Rice & Grains' },
    { name: 'Meat & Fish' },
    { name: 'Snacks & Beverages' }
];

const productsData = [
    // Fruits & Vegetables
    {
        name: 'Fresh Red Apples',
        categoryName: 'Fruits & Vegetables',
        price: 250,
        stock: 50,
        imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        name: 'Organic Bananas (Dozen)',
        categoryName: 'Fruits & Vegetables',
        price: 120,
        stock: 100,
        imageUrl: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        name: 'Fresh Spinach (Palak)',
        categoryName: 'Fruits & Vegetables',
        price: 60,
        stock: 30,
        imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        name: 'Red Onions (1kg)',
        categoryName: 'Fruits & Vegetables',
        price: 90,
        stock: 200,
        imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },

    // Dairy & Bakery
    {
        name: 'Fresh Cow Milk (1L)',
        categoryName: 'Dairy & Bakery',
        price: 110,
        stock: 50,
        imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        name: 'Whole Wheat Bread',
        categoryName: 'Dairy & Bakery',
        price: 80,
        stock: 40,
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        name: 'Organic Butter (500g)',
        categoryName: 'Dairy & Bakery',
        price: 450,
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },

    // Rice & Grains
    {
        name: 'Basmati Rice (5kg)',
        categoryName: 'Rice & Grains',
        price: 1200,
        stock: 100,
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        name: 'Red Lentils (Masoor Dal) - 1kg',
        categoryName: 'Rice & Grains',
        price: 180,
        stock: 80,
        imageUrl: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        name: 'Wheat Flour (Atta) - 5kg',
        categoryName: 'Rice & Grains',
        price: 350,
        stock: 60,
        imageUrl: 'https://images.unsplash.com/photo-1627485937980-221c88ac04f9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },

    // Meat & Fish
    {
        name: 'Fresh Chicken Breast (1kg)',
        categoryName: 'Meat & Fish',
        price: 450,
        stock: 30,
        imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        name: 'Fresh Fish - Rohu (1kg)',
        categoryName: 'Meat & Fish',
        price: 600,
        stock: 20,
        imageUrl: 'https://images.unsplash.com/photo-1517512006864-7edc30933185?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },

    // Snacks
    {
        name: 'Digestive Biscuits',
        categoryName: 'Snacks & Beverages',
        price: 150,
        stock: 100,
        imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        name: 'Potato Chips (Salted)',
        categoryName: 'Snacks & Beverages',
        price: 50,
        stock: 200,
        imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await Product.deleteMany({});
        await Category.deleteMany({});
        console.log('Cleared existing products and categories.');

        // Insert Categories
        const createdCategories = await Category.insertMany(categoriesData);
        console.log(`Inserted ${createdCategories.length} categories.`);

        // Create a map of category Name -> ID
        const categoryMap = {};
        createdCategories.forEach(cat => {
            categoryMap[cat.name] = cat._id;
        });

        // Prepare Products with Category IDs
        const productsWithIds = productsData.map(product => {
            const categoryId = categoryMap[product.categoryName];
            if (!categoryId) {
                console.error(`Category not found for product: ${product.name} (${product.categoryName})`);
                return null;
            }
            return {
                name: product.name,
                category: categoryId,
                price: product.price,
                stock: product.stock,
                imageUrl: product.imageUrl
            };
        }).filter(p => p !== null);

        // Insert Products
        await Product.insertMany(productsWithIds);
        console.log(`Inserted ${productsWithIds.length} products.`);

        console.log('Database seeded successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
