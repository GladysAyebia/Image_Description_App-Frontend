import { useState, useRef, useEffect } from 'react';
import './App.css';
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faPlus, faUpload, faPaperPlane, faImage } from '@fortawesome/free-solid-svg-icons';

function App() {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const chatBoxRef = useRef(null);
  const followUpRef = useRef(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    setFile(selectedFile);
    setError(null);
  };

  const handlePromptChange = (e) => setPrompt(e.target.value);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      if (droppedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please drop a valid image file');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (sessionId) {
        followUpRef.current?.closest('form')?.requestSubmit();
      }
    }
  };

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

  const handleSavePDF = () => {
    if (messages.length === 0) {
      alert("No chat to save!");
      return;
    }

    const doc = new jsPDF();

    const logo = new Image();
    logo.src = "/icons/pwa-192x192.png";
    doc.addImage(logo, "PNG", 10, 10, 20, 20);

    doc.setFontSize(16);
    doc.text("ImoScope - Chat Report", 40, 20);

    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleString()}`, 40, 28);

    let y = 40;

    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const imgData = e.target.result;
        doc.addImage(imgData, 'JPEG', 10, y, 60, 60);
        y += 70;

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
            <div 
              className="form-group"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <label htmlFor="image-upload" className={`custom-file-upload ${isDragging ? 'dragging' : ''}`}>
                <FontAwesomeIcon icon={faImage} /> {isDragging ? 'Drop Image Here' : 'Choose Image'}
              </label>
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
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faUpload} /> Analyze Image
                </>
              )}
            </button>
          </form>
        )}

        {sessionId && (
          <>
            <div className="chat-box" ref={chatBoxRef}>
              {messages.map((m, idx) => (
                <div key={idx} className={`chat-message ${m.role}`}>
                  <div className="bubble">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="chat-message assistant">
                  <div className="bubble typing">
                    <span className="typing-dots">
                      <span>.</span><span>.</span><span>.</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="chat-controls">
              <button onClick={handleSavePDF}>
                <FontAwesomeIcon icon={faSave} /> Save as PDF
              </button>
              <button onClick={handleNewChat}>
                <FontAwesomeIcon icon={faPlus} /> New Chat
              </button>
            </div>

            <form onSubmit={handleFollowUp} className="chat-input">
              <textarea
                ref={followUpRef}
                value={prompt}
                onChange={handlePromptChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask a follow-up... (Press Enter to send)"
                rows="2"
              />
              <button type="submit" disabled={isLoading}>
                <FontAwesomeIcon icon={faPaperPlane} /> Send
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
