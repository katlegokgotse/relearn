// pages/index.js
import { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  const handleFileChange = (event: any) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    
    if (!file) {
      setMessage('Please select a PDF file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:3333/transcripts/send', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('File uploaded successfully: ' + response.data.message);

      // Assuming the response contains the URL of the uploaded PDF
      setPdfUrl(response.data.pdfUrl); // Adjust according to your response structure
    } catch (error: any) {
      console.error(error);
      setMessage('Error uploading file: ' + error.message);
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1, padding: '20px' }}>
        <h1>Upload PDF Document</h1>
        <form onSubmit={handleSubmit}>
          <input type="file" accept=".pdf" onChange={handleFileChange} />
          <button type="submit">Upload</button>
        </form>
        {message && <p>{message}</p>}
      </div>

      <div style={{ flex: 1, padding: '20px' }}>
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            width="100%"
            height="500px"
            title="Uploaded PDF"
          />
        )}
      </div>
    </div>
  );
};

export default FileUpload;
