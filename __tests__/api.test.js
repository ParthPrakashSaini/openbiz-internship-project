import { POST as handleRegistration } from '../app/api/submit-registration/route'; // Adjust path if needed

// --- MOCKING SECTION ---

// Mock the 'next/server' module
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => {
      // Get status from options, or default to 200 for success
      const status = options?.status || 200;
      return {
        status,
        json: () => Promise.resolve(data),
        body: JSON.stringify(data),
      };
    }),
  },
}));

// Mock the Prisma client to avoid hitting the actual database in tests
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    registration: {
      create: jest.fn().mockResolvedValue({
        id: 'test-id',
        aadhaarNumber: '123456789012',
        name: 'Test User',
        panNumber: 'ABCDE1234F',
      }),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});


// --- TEST SUITE ---

describe('/api/submit-registration API Endpoint', () => {
  // Clear mock history before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Check for a successful registration with valid data
  it('should return a 200 status and success message for a valid submission', async () => {
    const mockBody = {
      aadhaarNumber: '123456789012',
      name: 'Test User',
      panNumber: 'ABCDE1234F',
    };

    const req = new Request('http://localhost/api/submit-registration', {
      method: 'POST',
      body: JSON.stringify(mockBody),
    });

    // Call the API handler function
    const response = await handleRegistration(req);
    const data = await response.json();

    // Assert the response is correct
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Registration completed and saved successfully!');
  });

  // Test 2: Check for a failure with an invalid PAN number
  it('should return a 400 status for an invalid PAN number', async () => {
    const mockBody = {
      aadhaarNumber: '123456789012',
      name: 'Test User',
      panNumber: 'INVALIDPAN', // Invalid data
    };
    
    const req = new Request('http://localhost/api/submit-registration', {
      method: 'POST',
      body: JSON.stringify(mockBody),
    });

    const response = await handleRegistration(req);
    const data = await response.json();

    // Assert the error response is correct
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('A valid PAN number is required.');
  });
});
