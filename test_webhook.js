const tikklWebhook = require('./webhooks/tikkl');

// Mock request and response objects
const mockReq = {
  method: 'POST',
  body: {
    ticket_id: 'TICKET-12345',
    subject: 'Test Ticket from Tikkl',
    description: 'This is a test ticket created via Tikkl webhook',
    status: 'open',
    priority: 'high',
    customer_email: 'test@example.com',
    customer_name: 'Test User',
    agent_email: 'agent@company.com',
    agent_name: 'Support Agent',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    tags: ['urgent', 'test']
  }
};

const mockRes = {
  status: (code) => ({
    json: (data) => {
      console.log(`Response Status: ${code}`);
      console.log('Response Data:', JSON.stringify(data, null, 2));
      return mockRes;
    }
  })
};

// Test the webhook handler
console.log('🧪 Testing Tikkl Webhook Handler...');
tikklWebhook(mockReq, mockRes).catch(err => {
  console.error('❌ Test failed:', err.message);
});