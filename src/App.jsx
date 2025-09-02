import { useState } from 'react';
import './App.css';
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";

function App() {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handlePromptChange = (e) => setPrompt(e.target.value);

  // First request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setMessages([]);

    if (!file || !prompt) {
      setError('Please select an image and enter a prompt.');
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('prompt', prompt);

    try {
      setMessages([{ role: "user", text: prompt }]);

      const res = await fetch('https://image-description-app-backend.onrender.com/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Something went wrong on the server.');
      }

      const data = await res.json();
      setSessionId(data.sessionId);

      setMessages((prev) => [...prev, { role: "assistant", text: data.result }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };

  // Follow-up
  const handleFollowUp = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!prompt) {
      setError('Please enter a follow-up question.');
      setIsLoading(false);
      return;
    }

    try {
      setMessages((prev) => [...prev, { role: "user", text: prompt }]);

      const res = await fetch('https://image-description-app-backend.onrender.com/api/followup', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, prompt }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Something went wrong on the server.');
      }

      const data = await res.json();

      setMessages((prev) => [...prev, { role: "assistant", text: data.result }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };

  const handleNewChat = () => {
  if (window.confirm("Are you sure you want to start a new chat? This will clear your current conversation.")) {
    setFile(null);
    setPrompt('');
    setSessionId(null);
    setMessages([]);
    setError(null);
    setIsLoading(false);
  }
};

  // Save chat as PDF with image
  const handleSavePDF = () => {
    if (messages.length === 0) {
      alert("No chat to save!");
      return;
    }

    const doc = new jsPDF();

    // Add logo
    const logo = new Image();
    logo.src = "/icons/pwa-192x192.png";
    doc.addImage(logo, "PNG", 10, 10, 20, 20);

    // Title
    doc.setFontSize(16);
    doc.text("ImoScope - Chat Report", 40, 20);

    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleString()}`, 40, 28);

    let y = 40; // vertical offset

    // Add uploaded image at top
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const imgData = e.target.result;
        doc.addImage(imgData, 'JPEG', 10, y, 60, 60); // size of image
        y += 70;

        // Add chat messages after image
        messages.forEach((m) => {
          const role = m.role === "assistant" ? "ImoScope AI" : "User";
          const text = `${role}: ${m.text}`;
          doc.setFont("helvetica", m.role === "assistant" ? "bold" : "normal");
          const splitText = doc.splitTextToSize(text, 170);
          doc.text(splitText, 10, y);
          y += splitText.length * 7 + 5;
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
        });

        doc.save(`ImoScope_Chat_${new Date().toISOString()}.pdf`);
      };
      reader.readAsDataURL(file);
    } else {
      // If no image, just save messages
      messages.forEach((m) => {
        const role = m.role === "assistant" ? "ImoScope AI" : "User";
        const text = `${role}: ${m.text}`;
        doc.setFont("helvetica", m.role === "assistant" ? "bold" : "normal");
        const splitText = doc.splitTextToSize(text, 170);
        doc.text(splitText, 10, y);
        y += splitText.length * 7 + 5;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
      doc.save(`ImoScope_Chat_${new Date().toISOString()}.pdf`);
    }
  };

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <img src="/icons/pwa-192x192.png" width={"70px"} alt="logo" />
        </div>
        <span className="tagline">ImoScope</span>
      </nav>

      <div className="container">
        <header className="hero">
          <h2>Turn Images Into Conversations</h2>
          <p>Upload an image and chat with ImoScope to analyze and understand it.</p>
          <h4>"ImoScope... Innovative Sight for Images"</h4>
        </header>

        {!sessionId && (
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
        )}

        {sessionId && (
          <>
            <div className="chat-box">
              {messages.map((m, idx) => (
                <div key={idx} className={`chat-message ${m.role}`}>
                  <div className="bubble">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="chat-message assistant">
                  <div className="bubble typing">...</div>
                </div>
              )}
            </div>

            {/* Chat Controls */}
            <div className="chat-controls">
              {sessionId && (
  <div className="chat-controls">
    <button onClick={handleSavePDF}>💾 Save as PDF</button>
    <button onClick={handleNewChat} style={{ marginLeft: "10px", backgroundColor: "#1cff08ff", color: "#fff" }}>
      🆕 New Chat
    </button>
  </div>
)}

            </div>

            <form onSubmit={handleFollowUp} className="chat-input">
              <textarea
                value={prompt}
                onChange={handlePromptChange}
                placeholder="Ask a follow-up..."
                rows="2"
              />
              <button type="submit" disabled={isLoading}>
                Send
              </button>
            </form>
          </>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>

      <footer className="footer">
        © {new Date().getFullYear()} ImoScope — Innovative Sight for Images
        <div>
          <img src="/icons/logos/Horizontal Lockup on White Background.png" width={"100px"} alt="footer logo" />
        </div>
      </footer>
    </div>
  );
}

export default App;
