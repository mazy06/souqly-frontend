const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing API connection...');
    
    const response = await fetch('http://localhost:8080/api/products?page=0&size=10');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('API Response:');
    console.log('Status:', response.status);
    console.log('Products count:', data.content?.length || 0);
    console.log('Total elements:', data.totalElements);
    console.log('Total pages:', data.totalPages);
    console.log('Current page:', data.currentPage);
    console.log('Size:', data.size);
    
    if (data.content && data.content.length > 0) {
      console.log('\nFirst product:');
      console.log('ID:', data.content[0].id);
      console.log('Title:', data.content[0].title);
      console.log('Price:', data.content[0].price);
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testAPI(); 