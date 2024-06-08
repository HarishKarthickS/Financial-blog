import {useEffect, useState} from "react";
import {Navigate, useParams} from "react-router-dom";
import Editor from "../Editor";
import app from '../Firebase.config';
import { getStorage } from "firebase/storage";
import { ref, uploadBytesResumable, getDownloadURL } from '@firebase/storage';
import axios from 'axios'

export default function EditPost() {
  const {id} = useParams();
  const storage = getStorage(app);
  const [title,setTitle] = useState('');
  const [summary,setSummary] = useState('');
  const [content,setContent] = useState('');
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [redirect, setRedirect] = useState(false);


  useEffect(() => {
    fetch('https://financial-blog-ozfu.onrender.com/post/'+id)
      .then(response => {
        response.json().then(postInfo => {
          setTitle(postInfo.title);
          setContent(postInfo.content);
          setSummary(postInfo.summary);
        });
      });
  }, []);

  async function updatePost(url) {
    const data = {
      title: title,
      summary: summary,
      content: content,
      cover: url}
      console.log(data)
      try {
        const response = await axios.put('https://financial-blog-ozfu.onrender.com/post/'+id, data, {
          withCredentials: true,
        });
      
        if (response.status === 200) {
          setRedirect(true);
        }
      } catch (error) {
        console.error('Error making PUT request:', error);
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
          updatePost(downloadUrl);
          setIsLoading(false);
        });
      }
    );
  }

  function handleFileChange(e) {
    setFile(e.target.files[0]);
  }

  function handleUpdate(ev) {
    ev.preventDefault();
    if (file) {
      handleFileUpload(file);
    } else {
      updatePost(url);
    }
  }
  if (redirect) {
    return <Navigate to={'/post/'+id} />
  }

  return (
    <form onSubmit={handleUpdate}>
      <input type="title"
             placeholder={'Title'}
             value={title}
             onChange={ev => setTitle(ev.target.value)} />
      <input type="summary"
             placeholder={'Summary'}
             value={summary}
             onChange={ev => setSummary(ev.target.value)} />
      <div>
        <input type="file" onChange={handleFileChange} />
      </div>
      <Editor onChange={setContent} value={content} />
      <button style={{marginTop:'5px'}}>Update post</button>
      {isLoading && <p>File uptating <b>{progress}%</b></p>}
    </form>
  );
}