// test-speech.js
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testSpeechAPI() {
  const form = new FormData();
  form.append('audio', fs.createReadStream('test-audio.wav'));
  
  try {
    const response = await axios.post('http://localhost:5000/api/speech-to-text', form, {
      headers: form.getHeaders()
    });
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testSpeechAPI();