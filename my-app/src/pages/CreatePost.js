import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Editor from "../Editor";
import app from '../Firebase.config';
import { getStorage } from "firebase/storage";
import { ref, uploadBytesResumable, getDownloadURL } from '@firebase/storage';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios'

export default function CreatePost() {
  const storage = getStorage(app);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [redirect, setRedirect] = useState(false);

  // useEffect(() => {
  //   if (url) {
  //     createPost();
  //   }
  // }, [url]);

  async function createPost() {
    const data = {
    title: title,
    summary: summary,
    content: content,
    cover: url}
    console.log(data)
    try {
      const response = await axios.post('https://financial-blog-ozfu.onrender.com/post', data, {
        withCredentials: true,
      });
    
      if (response.status === 200) {
        setRedirect(true);
      }
    } catch (error) {
      console.error('Error making POST request:', error);
    }
  }

  function handleFileUpload(file) {
    setIsLoading(true);
    const storageRef = ref(storage, `/files/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on("state_changed", 
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(progress);
      }, 
      (error) => {
        console.error(error);
        setIsLoading(false);
      }, 
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
          setUrl(downloadUrl);
          createPost(downloadUrl);
          setIsLoading(false);
        });
      }
    );
  }

  function handleFileChange(e) {
    setFile(e.target.files[0]);
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    if (file) {
      handleFileUpload(file);
    } else {
      createPost(url);
    }
  }

  if (redirect) {
    return <Navigate to="/" />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text"
        placeholder="Title"
        value={title}
        onChange={(ev) => setTitle(ev.target.value)}
      />
      <input 
        type="text"
        placeholder="Summary"
        value={summary}
        onChange={(ev) => setSummary(ev.target.value)}
      />
      <div>
        <input type="file" onChange={handleFileChange} />
      </div>
      <Editor value={content} onChange={setContent} />
      <button style={{ marginTop: '5px' }} type="submit">Create post</button>
      {isLoading && <p>File upload <b>{progress}%</b></p>}
    </form>
  );
}

