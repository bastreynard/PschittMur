const { connectToDatabase } = require('./utils/mongodb');

exports.handler = async function(event, context) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  const id = event.path.split('/').pop();
  if (!id) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: 'Problem ID is required' })
    };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: 'Invalid request body' })
    };
  }

  const { grade, userId } = data;
  // If userId is not provided, generate a default
  const userIdentifier = userId || 'anonymous_user';

  // Connect to the database
  const { db } = await connectToDatabase();

  try {
    const collection = db.collection('problems');

    // Find the problem by ID
    const problem = await collection.findOne({ id: parseInt(id) });
    
    if (!problem) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: 'Problem not found' })
      };
    }

    // Initialize grades array if it doesn't exist
    if (!problem.grades) {
      problem.grades = [];
    }

    // Update or add user rating
    const userIndex = problem.grades.findIndex(r => r.userIdentifier === userIdentifier);
    if (userIndex !== -1) {
      problem.grades[userIndex].grade = grade;
    } else {
      problem.grades.push({ userIdentifier, grade });
    }

    // Update problem in the database
    await collection.updateOne(
      { id: parseInt(id) },
      { 
        $set: { 
          grades: problem.grades,
          updatedAt: new Date().toISOString()
        } 
      }
    );

    // Return the updated problem
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(problem)
    };
  } catch (error) {
    console.error('Error voting grade:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Error voting grade' })
    };
  }
};