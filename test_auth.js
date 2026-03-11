const axios = require('axios');

const API_URL = 'http://localhost:3000';

const login = async (username, password) => {
    try {
        const res = await axios.post(`${API_URL}/users/login`, { username, password });
        return res.data.token;
    } catch (err) {
        console.error(`Login failed for ${username}: ${err.response?.status} - ${err.response?.data?.err?.message || err.message}`);
        return null;
    }
}

async function runTests() {
    try {
        console.log('--- TEST 1: Registering Admin User ---');
        await axios.post(`${API_URL}/users/signup`, {
            username: 'admin_test',
            password: 'password123',
            admin: true
        }).catch(e => console.log('Admin already exists'));

        const adminToken = await login('admin_test', 'password123');
        if (!adminToken) return;
        console.log('Admin Token:', adminToken.substring(0, 20) + '...');

        console.log('\n--- TEST 2: Registering Ordinary User A ---');
        await axios.post(`${API_URL}/users/signup`, {
            username: 'ordinary_user_a',
            password: 'password123',
            admin: false
        }).catch(e => console.log('User A already exists'));

        const userAToken = await login('ordinary_user_a', 'password123');
        if (!userAToken) return;

        console.log('\n--- TEST 3: Registering Ordinary User B ---');
        await axios.post(`${API_URL}/users/signup`, {
            username: 'ordinary_user_b',
            password: 'password123',
            admin: false
        }).catch(e => console.log('User B already exists'));

        const userBToken = await login('ordinary_user_b', 'password123');
        if (!userBToken) return;

        console.log('\n--- TEST 4: Admin GET /users ---');
        try {
            const usersGet = await axios.get(`${API_URL}/users`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            console.log('SUCCESS: Admin can GET /users. Found', usersGet.data.length, 'users');
        } catch (err) {
            console.error('FAIL: Admin GET /users failed', err.response?.status);
        }

        console.log('\n--- TEST 5: Ordinary User GET /users ---');
        try {
            await axios.get(`${API_URL}/users`, {
                headers: { Authorization: `Bearer ${userAToken}` }
            });
            console.error('FAIL: Ordinary user was able to GET /users!');
        } catch (err) {
            console.log('SUCCESS: Ordinary user GET /users blocked with status', err.response?.status);
        }

        console.log('\n--- TEST 6: User A attempts to create a Quiz ---');
        let quizId;
        try {
            await axios.post(`${API_URL}/quizzes`, {
                title: 'User Quiz',
                description: 'Should fail'
            }, {
                headers: { Authorization: `Bearer ${userAToken}` }
            });
            console.error('FAIL: Ordinary user was able to create a Quiz!');
        } catch (err) {
            console.log('SUCCESS: Ordinary user creating Quiz blocked with status', err.response?.status);
        }

        console.log('\n--- TEST 7: Admin creates a Quiz ---');
        try {
            const quizCreate = await axios.post(`${API_URL}/quizzes`, {
                title: 'Admin Quiz',
                description: 'Should succeed'
            }, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            quizId = quizCreate.data._id;
            console.log('SUCCESS: Admin created Quiz:', quizId);
        } catch (err) {
            console.error('FAIL: Admin creating Quiz failed', err.response?.data);
        }

        console.log('\n--- TEST 8: User A creates a Question ---');
        let questionId;
        try {
            const qCreate = await axios.post(`${API_URL}/questions`, {
                text: 'What is 2+2?',
                options: ['1', '2', '3', '4'],
                correctAnswerIndex: 3
            }, {
                headers: { Authorization: `Bearer ${userAToken}` }
            });
            questionId = qCreate.data._id;
            console.log('SUCCESS: User A created Question:', questionId);
            console.log('Question Author is:', qCreate.data.author);
        } catch (err) {
            console.error('FAIL: User A creating Question failed', err.response?.data);
        }

        console.log('\n--- TEST 9: Admin tries to edit User A\'s Question ---');
        try {
            await axios.put(`${API_URL}/questions/${questionId}`, {
                text: 'Edited by Admin'
            }, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            console.error('FAIL: Admin was able to edit User A\'s Question!');
        } catch (err) {
            console.log('SUCCESS: Admin editing User A\'s Question blocked with status', err.response?.status);
        }

        console.log('\n--- TEST 10: User B tries to edit User A\'s Question ---');
        try {
            await axios.put(`${API_URL}/questions/${questionId}`, {
                text: 'Edited by User B'
            }, {
                headers: { Authorization: `Bearer ${userBToken}` }
            });
            console.error('FAIL: User B was able to edit User A\'s Question!');
        } catch (err) {
            console.log('SUCCESS: User B editing User A\'s Question blocked with status', err.response?.status);
        }

        console.log('\n--- TEST 11: User A edits their own Question ---');
        try {
            await axios.put(`${API_URL}/questions/${questionId}`, {
                text: 'Edited by Author A'
            }, {
                headers: { Authorization: `Bearer ${userAToken}` }
            });
            console.log('SUCCESS: User A edited their own Question');
        } catch (err) {
            console.error('FAIL: User A editing own Question failed', err.response?.status);
        }

        console.log('\n--- TEST 12: Ordinary User GET /quizzes (Should be blocked) ---');
        try {
            await axios.get(`${API_URL}/quizzes`, {
                headers: { Authorization: `Bearer ${userAToken}` }
            });
            console.error('FAIL: Ordinary user was able to GET /quizzes!');
        } catch (err) {
            console.log('SUCCESS: Ordinary user GET /quizzes blocked with status', err.response?.status);
        }

        console.log('\n--- TEST 13: Admin GET /quizzes (Should succeed) ---');
        try {
            const quizzesGet = await axios.get(`${API_URL}/quizzes`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            console.log('SUCCESS: Admin can GET /quizzes. Found', quizzesGet.data.length, 'quizzes');
        } catch (err) {
            console.error('FAIL: Admin GET /quizzes failed', err.response?.status);
        }

    } catch (err) {
        console.error('Global Error:', err);
    }
}

runTests();
