const API_URL = 'http://localhost:8080/api/v1/payroll';

export const generatePayroll = async (token, details) => {
    const response = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(details)
    });
    return response.json();
};

export const getPayrolls = async (token, filters = {}) => {
    // Convert filters object to query string
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}?${query}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
};
