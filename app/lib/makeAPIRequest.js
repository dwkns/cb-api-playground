import { createJWT } from './getToken.js'; // Import JWT creation function

// Function to make the API request
export async function makeRequest(requestDetails) {
  const jwtToken = createJWT(requestDetails); // Create JWT token based on request details

  const { url, requestPath, requestParams } = requestDetails // Destructure request details
  const params = requestParams ? `?${requestParams}` : ''; // append query params if any

  const uri = `https://${url}${requestPath}${params}` // construct full URI

  // Add the token to the header
  const options = {
    method: 'GET',
    headers: { Authorization: `Bearer ${jwtToken}` },
    body: undefined,
  };

  // Do tha API call 
  try {
    const response = await fetch(uri, options); // Make the fetch call

    let data;
    const contentType = response.headers.get('content-type'); // Check content type
    // Parse response based on content type
    if (contentType && contentType.includes('application/json')) {
      data = await response.json(); // we have a data response
    } else {
      data = await response.text();
    }
    // Handle non-OK responses
    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText} for ${uri}`);
      console.error('Response:', JSON.stringify(data, null, 2));
    } else {
      console.log(`✅ API Success: ${response.status} ${response.statusText} for ${uri}`);
      return data // Return the data
    }
  } catch (error) {
    console.error('Request error:', error);
  }
}
