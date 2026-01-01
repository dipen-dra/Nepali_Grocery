
import request from 'supertest';
import mongoose from 'mongoose';
import { app, server } from '../server.js'; 
import User from '../models/User.js';
import path from 'path'; 
import { fileURLToPath } from 'url'; 


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let userToken;
let userId;
let testUserEmail = 'usertest@example.com';
let testUserPassword = 'TestPassword123!';
let testUserFullName = 'Test User';

beforeAll(async () => {
    
    await User.deleteMany({ email: { $in: [testUserEmail, 'loginfail@example.com', 'updatetest@example.com', 'existing@example.com'] } });
    console.log('--- beforeAll (User Tests): Cleaned up previous test data ---');
});

afterAll(async () => {
    
    await User.deleteMany({ email: { $in: [testUserEmail, 'loginfail@example.com', 'updatetest@example.com', 'existing@example.com'] } });

    
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log('--- afterAll (User Tests): MongoDB connection closed cleanly ---');
    }

    
    if (server && server.listening) {
        await new Promise(resolve => server.close(resolve));
        console.log('--- afterAll (User Tests): Express server closed cleanly ---');
    }
    console.log('--- afterAll (User Tests): Cleanup complete ---');
});

describe('User Authentication & Profile API Tests', () => {

    
    it('should register a new user successfully', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                fullName: testUserFullName,
                email: testUserEmail,
                password: testUserPassword
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('User registered successfully.');
        expect(res.body.data).toHaveProperty('_id');
        expect(res.body.data.email).toBe(testUserEmail);
        expect(res.body.data.fullName).toBe(testUserFullName);
        expect(res.body.data.role).toBe('normal'); // Default role
        expect(res.body.data).not.toHaveProperty('password'); // Password should not be returned

        
        userId = res.body.data._id;
    });

    it('should return 400 for missing registration fields', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                fullName: 'Incomplete User',
                email: 'incomplete@example.com'
                
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Please fill all fields.');
    });

    it('should return 400 for duplicate email registration', async () => {
        
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                fullName: testUserFullName,
                email: testUserEmail,
                password: testUserPassword
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('User with this email already exists.');
    });

    
    it('should log in a registered user successfully', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUserEmail,
                password: testUserPassword
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty('token');
        expect(res.body.data.email).toBe(testUserEmail);
        expect(res.body.data.fullName).toBe(testUserFullName);
        expect(res.body.data.role).toBe('normal');
        expect(res.body.data).not.toHaveProperty('password'); 

        userToken = res.body.token; 
    });

    it('should return 401 for invalid login credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUserEmail,
                password: 'WrongPassword!' 
            });

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid email or password.');
    });

    it('should return 401 for non-existent user login', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'nonexistent@example.com',
                password: 'AnyPassword123!'
            });

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid email or password.');
    });

    it('should return 400 for missing login fields', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUserEmail
               
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Email and password are required.');
    });

    // GET /api/auth/profile
    it('should get authenticated user profile', async () => {
        const res = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${userToken}`); 
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data._id.toString()).toBe(userId.toString());
        expect(res.body.data.email).toBe(testUserEmail);
        expect(res.body.data.fullName).toBe(testUserFullName);
        expect(res.body.data).not.toHaveProperty('password'); 
    });

    it('should return 401 for unauthenticated profile access', async () => {
        const res = await request(app)
            .get('/api/auth/profile'); 
        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/Authentication failed: No token provided./i);
    });

    // PUT /api/auth/profile
    it('should update authenticated user profile (fullName and location)', async () => {
        const updatedFullName = 'Updated Test User';
        const updatedLocation = 'Kathmandu, Nepal';

        const res = await request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                fullName: updatedFullName,
                location: updatedLocation
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Profile updated successfully');
        expect(res.body.data.fullName).toBe(updatedFullName);
        expect(res.body.data.location).toBe(updatedLocation);

        
        const userInDb = await User.findById(userId);
        expect(userInDb.fullName).toBe(updatedFullName);
        expect(userInDb.location).toBe(updatedLocation);
    });

    it('should return 401 for unauthenticated profile update', async () => {
        const res = await request(app)
            .put('/api/auth/profile')
            .send({ fullName: 'Unauthorized Update' }); 

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/Authentication failed: No token provided./i);
    });

    it('should return 400 if updating email to an already existing email', async () => {
        
        await request(app)
            .post('/api/auth/register')
            .send({ fullName: 'Existing User', email: 'existing@example.com', password: 'ExistingPassword123!' });

        const res = await request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ email: 'existing@example.com' }); 

        expect(res.statusCode).toBe(400); 
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('User with this email already exists.');
    });


    
    it('should update user profile picture', async () => {
       
        const dummyImagePath = path.join(__dirname, 'dummy.png'); 

        

        const res = await request(app)
            .put('/api/auth/profile/picture')
            .set('Authorization', `Bearer ${userToken}`)
            .attach('profilePicture', dummyImagePath); 

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Profile picture updated successfully.');
        expect(res.body.data.profilePicture).toMatch(/\/images\/profile-pictures\/.+\.(png|jpg|jpeg)$/); 

       
        const userInDb = await User.findById(userId);
        expect(userInDb.profilePicture).toMatch(/\/images\/profile-pictures\/.+\.(png|jpg|jpeg)$/);
    });

    it('should return 401 for unauthenticated profile picture update', async () => {
        const dummyImagePath = path.join(__dirname, 'dummy.png'); 

        const res = await request(app)
            .put('/api/auth/profile/picture')
            .attach('profilePicture', dummyImagePath); 

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/Authentication failed: No token provided./i);
    });

    it('should return 400 if no file is uploaded for profile picture update', async () => {
        const res = await request(app)
            .put('/api/auth/profile/picture')
            .set('Authorization', `Bearer ${userToken}`); 

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('No file uploaded.');
    });
});