import { useState, useRef } from "react";
import { db } from "./firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import axios from "axios";
import './Addword.css';
import headImg from './assets/head-img.png';
const CLOUD_NAME = "doi4m7trz"; // Your Cloudinary Cloud Name
const UPLOAD_PRESET = "img-uploader"; // Your Cloudinary Upload Preset

function AddWord() {
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [description, setDescription] = useState("");
  const [audioURL, setAudioURL] = useState("");
  const [formVibility, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

  // Start recording audio
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    audioChunks.current = [];

    mediaRecorder.current.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };

    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
      setAudioBlob(audioBlob);
    };

    mediaRecorder.current.start();
    setRecording(true);
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  };

  // Upload recorded audio to Cloudinary
  const uploadAudioToCloudinary = async () => {
    if (!audioBlob) {
      alert("Please record an audio file first.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", audioBlob);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
        formData
      );
      const uploadedURL = response.data.secure_url;
      setAudioURL(uploadedURL);
      alert("Audio uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  // Save word to Firestore
  const addWordToFirestore = async () => {
    if (!word.trim() || !translation.trim()) {
      alert("Word and translation cannot be empty!");
      return;
    }

    try {
      await addDoc(collection(db, "words"), {
        word,
        translation,
        description,
        audioURL,
        createdAt: new Date(),
      });
      alert("Word added successfully!");
      setWord("");
      setTranslation("");
      setDescription("");
      setAudioURL("");
      setAudioBlob(null);
    } catch (error) {
      console.error("Error adding word:", error);
    }
  };

  const showForm=(e)=>{
    if(e){
        setShowForm(!formVibility);
    }
  }
  return (
    <div className={'add-word' + (formVibility ? '' : ' center')}>
      <h2>Add a new word to<br/> 
      <img src={headImg} alt="word" onClick={e=>showForm(e)}/>
      </h2>
      <div className={'form' + (formVibility ? ' show' : '')} >

        <div className="d-flex">
            <input
                type="text"
                placeholder="Enter German word"
                value={word}
                onChange={(e) => setWord(e.target.value)}
            />
            <input
                type="text"
                placeholder="Enter English translation"
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
            />
        </div>
       
        <textarea
            placeholder="Enter description (can include links)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
        />

        <div className="btn-cont">
            {/* Play Recorded Audio */}
            {audioBlob && (
                <div className="record">
                <p>Recorded Pronunciation:</p>
                <div className="rec">
                    <audio controls src={URL.createObjectURL(audioBlob)}></audio>
                    <button onClick={uploadAudioToCloudinary} disabled={uploading}>
                        {uploading ? "Uploading..." : "Upload"}
                    </button>
                </div>
               
                </div>
            )}

            
            {/* Show Uploaded Audio */}
            {audioURL && (
                <div className="record">
                <p>Uploaded Pronunciation:</p>
                <audio controls src={audioURL}></audio>
                </div>
            )}

            {/* Audio Recording */}
            {recording ? (
                <button onClick={stopRecording}>Stop Recording</button>
            ) : (
                <button onClick={startRecording}>Record Audio</button>
            )}


            <button onClick={addWordToFirestore}>Save Word</button>
        </div>
    </div>
      
    </div>
  );
}

export default AddWord;
