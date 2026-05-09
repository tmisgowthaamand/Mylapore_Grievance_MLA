import axios from 'axios';

async function testFlow() {
  try {
    const res = await axios.post('http://localhost:4000/api/flow/exchange', {
      action: 'data_exchange',
      screen: 'REG_MANUAL',
      data: { init_phone: '1234567890' },
      payload: {
        action: 'save_manual',
        name: 'Nirmal',
        epic: 'RJE12341223',
        email: '',
        gender: 'Male'
      }
    });
    console.log('Response:', res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

testFlow();
