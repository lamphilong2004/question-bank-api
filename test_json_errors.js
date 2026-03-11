const axios = require('axios');

async function testErrors() {
    const baseUrl = 'http://localhost:3000';

    console.log('Testing 404 Not Found...');
    try {
        await axios.get(`${baseUrl}/non-existent-route`);
    } catch (error) {
        console.log('Status:', error.response.status);
        console.log('Response Body:', JSON.stringify(error.response.data, null, 2));
        if (error.response.headers['content-type'].includes('application/json')) {
            console.log('✅ Success: Content-Type is application/json');
        } else {
            console.log('❌ Failure: Content-Type is NOT application/json');
        }
    }

    console.log('\nTesting 401 Unauthorized (Protected Route)...');
    try {
        await axios.get(`${baseUrl}/users`);
    } catch (error) {
        console.log('Status:', error.response.status);
        console.log('Response Body:', JSON.stringify(error.response.data, null, 2));
    }
}

testErrors();
