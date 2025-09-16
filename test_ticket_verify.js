// Test the ticket verification endpoint
const testTicketVerification = async () => {
  const testData = {
    ticketId: 'BGM2026-001',
    userId: '507f1f77bcf86cd799439011', // Example MongoDB ObjectId
    referralCode: 'ABC123'
  };

  try {
    const response = await fetch('/api/ticket/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('Test result:', result);
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Uncomment to run test
// testTicketVerification();