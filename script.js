// script.js
console.log(response.output_text);

console.log("script.js has loaded!"); // Debugging: Confirms script loads

// --- 1. Get References to HTML Elements ---
const preferenceInput = document.getElementById('preferenceInput');
const getRecommendationBtn = document.getElementById('getRecommendationBtn');
const recommendationsOutput = document.getElementById('recommendationsOutput');
const loadingText = document.querySelector('.loading-text');
const errorText = document.querySelector('.error-text');

// --- 2. API Key and Endpoint ---
// IMPORTANT: Replace 'YOUR_GEMINI_API_KEY' with your actual API key from Google AI Studio.
// For a school presentation running locally, you might put it here.
// For real web applications deployed online, you should NEVER expose API keys directly in client-side code.
// They should be handled securely on a backend server or via environment variables.
const GEMINI_API_KEY = 'AIzaSyArFt0v6GwO-VNurzvIUoX-Zx1YpW7s11Q'; // <<< REPLACE THIS with your actual key!
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

// --- 3. Helper Functions ---

// Helper function to show/hide messages (loading, error)
function showMessage(element, isVisible) {
    element.classList.toggle('hidden', !isVisible);
}

// Helper function to display the AI's response
function displayRecommendation(text) {
    recommendationsOutput.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`; // Replace newlines with <br> for display
    // Remove placeholder styling if it exists (for potential future uses)
    if (recommendationsOutput.classList.contains('placeholder-text')) {
        recommendationsOutput.classList.remove('placeholder-text');
    }
}

// Helper function to clear previous messages and output
function resetOutput() {
    // Reset the output area to its initial state
    recommendationsOutput.innerHTML = '<p class="placeholder-text">Recommendations will appear here after you click "Get Recommendations".</p>';
    recommendationsOutput.classList.add('placeholder-text'); // Ensure placeholder styling is applied if needed

    // Hide any active loading or error messages
    showMessage(loadingText, false);
    showMessage(errorText, false);
}

// --- 4. Main Recommendation Logic ---
async function getAIRecommendation() {
    console.log("getAIRecommendation function started."); // Debugging: Confirm function call

    const userPreference = preferenceInput.value.trim();

    if (userPreference === '') {
        alert('Please enter your preferences to get recommendations!');
        resetOutput(); // Reset display if input is empty
        return; // Stop if input is empty
    }

    resetOutput(); // Clear previous output and messages before showing loading
    showMessage(loadingText, true); // Show loading message

    // Construct the prompt for the AI
    // Being specific with your prompt helps guide the AI's output.
    // Example for recipes: "Generate 3 quick and healthy dinner recipes based on preferences: '${userPreference}'.
    //                       Provide them in a clear, bulleted list format with a brief description for each."
    // Example for books: "Generate 3 fantasy adventure book recommendations based on preferences: '${userPreference}'.
    //                     Provide them in a clear, bulleted list format including title, author, and a short summary."
    const promptText = `Generate 3 recommendations based on the following preferences: "${userPreference}".
    Please provide them in a clear, bulleted list format, like this:
    - Recommendation 1: Brief description.
    - Recommendation 2: Brief description.
    - Recommendation 3: Brief description.`;

    console.log("Sending prompt to AI:", promptText); // Debugging: Show prompt

    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: promptText }]
                }]
            })
        });

        console.log("API Response Status:", response.status); // Debugging: Show HTTP status

        if (!response.ok) {
            // If response is not OK (e.g., 400, 401, 403, 500)
            const errorData = await response.json();
            console.error('API error details:', errorData); // Debugging: Log full error response
            throw new Error(`HTTP error! Status: ${response.status} - ${errorData.error.message || 'Unknown API error'}`);
        }

        const data = await response.json();
        console.log('Full AI Response Data:', data); // Debugging: Log the full successful response

        // Extract the AI's generated text
        // The exact path might vary slightly depending on the API's response structure,
        // but for Gemini Pro, it's typically data.candidates[0].content.parts[0].text
        const aiGeneratedText = data.candidates && data.candidates[0] &&
                                data.candidates[0].content && data.candidates[0].content.parts[0] &&
                                data.candidates[0].content.parts[0].text;

        if (aiGeneratedText) {
            displayRecommendation(aiGeneratedText);
            console.log("AI generated text displayed successfully."); // Debugging
        } else {
            throw new Error('No text content found in AI response or unexpected format.');
        }

    } catch (error) {
        console.error('Failed to get AI recommendation (caught error):', error); // Debugging: Log the error object
        showMessage(errorText, true); // Show error message to user
        recommendationsOutput.innerHTML = '<p class="placeholder-text">Failed to generate recommendations. Please try a different input or check your API key/console for errors.</p>';
        recommendationsOutput.classList.add('placeholder-text'); // Apply placeholder styling
    } finally {
        showMessage(loadingText, false); // Hide loading message regardless of success or failure
        console.log("getAIRecommendation function finished."); // Debugging: Confirm function end
    }
}

// --- 5. Event Listener ---
// Add event listener to the button
getRecommendationBtn.addEventListener('click', () => {
    console.log("Button clicked!"); // Debugging: Confirms button click registered
    getAIRecommendation();
});