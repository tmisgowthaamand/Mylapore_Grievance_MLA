import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const TWO_FACTOR_API_KEY = process.env.TWO_FACTOR_API_KEY || '98c8d72c-2ccd-11f1-ae4a-0200cd936042';

export const otpService = {
  async sendOTP(phone) {
    try {
      const url = `https://2factor.in/API/V1/${TWO_FACTOR_API_KEY}/SMS/${phone}/AUTOGEN`;
      const response = await axios.get(url);
      if (response.data.Status === 'Success') {
        return { success: true, sessionId: response.data.Details };
      }
      return { success: false, error: 'Failed to send OTP' };
    } catch (error) {
      console.error('2Factor Send Error:', error.message);
      return { success: false, error: 'SMS Gateway Error' };
    }
  },

  async verifyOTP(phone, otp) {
    // In demo mode or if using specific testing keys, we might want a backdoor,
    // but here we use the actual 2Factor API.
    try {
      // Use VERIFY3 to verify using phone number and OTP
      const url = `https://2factor.in/API/V1/${TWO_FACTOR_API_KEY}/SMS/VERIFY3/${phone}/${otp}`;
      const response = await axios.get(url);
      if (response.data.Status === 'Success') {
        return true;
      }
      return false;
    } catch (error) {
      console.error('2Factor Verify Error:', error.response?.data?.Details || error.message);
      return false;
    }
  }
};
