// src/App.jsx
import { useState } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setResponse('');

    if (!file || !prompt) {
      setError('Please select an image and enter a prompt.');
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('prompt', prompt);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Something went wrong on the server.');
      }

      const data = await res.json();
      setResponse(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h2>Image Analyser</h2>
        <hr />
        <p>Upload an image and ask a question about it.</p>
      </header>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="image-upload">Choose Image:</label>
          <input 
            id="image-upload" 
            type="file" 
            accept="image/jpeg, image/png" 
            onChange={handleFileChange} 
          />
          {file && (
            <div className="preview">
              <img src={URL.createObjectURL(file)} alt="Preview" />
            </div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="prompt-input">Your Question:</label>
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={handlePromptChange}
            placeholder="e.g., 'What is in this picture and what is happening?'"
            rows="3"
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Analyzing...' : 'Analyze Image'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {response && (
        <div className="response-box">
          <h3>Gemini's Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

export default App;