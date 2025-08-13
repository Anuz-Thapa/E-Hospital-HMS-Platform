import React, { useState } from 'react';
import { Image as ImageIcon, SquareArrowLeft, SendHorizontal } from 'lucide-react'
import './AskAI.css';
import axios from 'axios';
import aidoctor from '../../assets/aidoctor.png';
import docprofile from '../../assets/docprofile.png';
import { AiModel } from '../../utils/auth';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';

const AskAI = () => {
  const [messages, setMessages] = useState([]); //for displaying all the conversation
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [analysisReport,setAnalysisReport]=useState(false);
  const navigate = useNavigate()
  const handleclick = () => {
    navigate('/')
  }

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() && !image) return;


    //for text to speech features provided by Elevenlabs
    const playAudioFromBase64 = (base64Audio) => {
      const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`);
      audio.play().catch((err) => console.error('Playback failed:', err));
    };

    const userMessage = { sender: 'user', text: input, image: image ? URL.createObjectURL(image) : null, };   //defining userMessage dict to include in messages list
    setMessages((prev) => [...prev, userMessage]); //add new user messsage to the previous one in the list
    setInput('');
    setLoading(true);

    try {
      const response = await AiModel(input, image);
      // const aiMessageText = response.data?.response || response.error || 'Sorry, no response received.';
      const audioBase64 = response.data?.audio_base64;
      const aiMessage = {  //defining aimessage dict to include in message list.
        sender: 'ai',
        text: response.data?.response || response.error || 'Sorry, no response received.',
      };

      setMessages((prev) => [...prev, aiMessage]); //adding new ai message to the previous one in the list
      if (audioBase64) {
        playAudioFromBase64(audioBase64);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Error: Failed to reach the AI backend.' },
      ]);
      speak(errorMessage); // Optional: Speak error too
    } finally {
      setLoading(false); //finally block is to be reached even if error occurs or not
    }
  };

  return (
    <>
      {/* <button
        className="arrowback"
        onClick={handleclick}>
        <SquareArrowLeft className="w-5 h-5" />
      </button> */}
      <div className="ask-ai-wrapper" style={{ display: 'flex', alignItems: 'flex-start' }}>
        <div className="ask-ai-container" style={{ flex: 1, minWidth: 0 }}>
          <h2>Ask AI</h2>
          <div className="chat-window">
            {messages.length === 0 ? (
              <img src={aidoctor} alt="Description of image" className="ai-doctor" />
            ) : (
              messages.map((msg, i) => (
                <>
                  <div key={i} className={`chat-bubble ${msg.sender}`}>
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="User uploaded"
                        className="chat-image"
                      />
                    )}
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </>
              )
              )
            )}

            {/* {loading && <div className="chat-bubble ai">Thinking...</div>} */}
            {loading && (
              <div className="chat-bubble ai typing">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            )}

          </div>
          <form className="chat-input" onSubmit={sendMessage}>
            <label htmlFor="image-upload" className="image-upload-icon">
              <ImageIcon className="icon" style={{ fontSize: "50px" }} />
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => setImage(e.target.files[0])}
            />
            <input
              type="text"
              value={input}
              placeholder="Ask something..."
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={loading} className="send-button">
              <SendHorizontal className="icon" />
            </button>

          </form>
        </div>


        <div
          className="image-analysis-panel"
          style={{
            color:'white',
            marginTop:'50px',
            height:'600px',
            width: '460px',
            minWidth: '250px',
            background: '#1b263b',
            borderRadius: '20px',
            padding: '1rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            overflowY: 'auto',
            maxHeight: '80vh',
          }}
        >
          <h3>Image Analysis Result</h3>
          {analysisReport ? (
            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{imageAnalysisResult}</pre>
          ) : (
            <p>No image analysis result yet.</p>
          )}
        </div>


      </div>
    </>
  );

};

export default AskAI;
