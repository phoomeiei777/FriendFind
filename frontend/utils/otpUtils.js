// Utility for OTP Logic

export const sendOtp = async (phoneNumber) => {
  return new Promise((resolve) => {
    // Generate a 4-digit OTP mock
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Simulate network delay
    setTimeout(() => {
      resolve({
        success: true,
        otp: generatedOtp,
        message: 'OTP has been sent to ' + phoneNumber
      });
    }, 800);
  });
};
