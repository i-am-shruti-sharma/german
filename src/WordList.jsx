import { useEffect, useState } from "react";
import { db } from "./firebaseConfig";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import axios from "axios";
import './Wordlist.css';
const CLOUD_NAME = "doi4m7trz";
const UPLOAD_PRESET = "img-uploader";

function WordList() {
  const [words, setWords] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // 🔹 Search state
 // 🔹 Filter words based on search query
 const filteredWords = words.filter(word =>
    word.word.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    async function fetchWords() {
      try {
        const querySnapshot = await getDocs(collection(db, "words"));
        setWords(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching words:", error);
      }
    }
    fetchWords();
  }, []);

  const deleteWord = async (id) => {
    try {
      await deleteDoc(doc(db, "words", id));
      setWords((prevWords) => prevWords.filter((word) => word.id !== id));
    } catch (error) {
      console.error("Error deleting word:", error);
    }
  };

  const uploadNewAudio = async (wordId) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "audio/*";
    fileInput.click();

    fileInput.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      try {
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
          formData
        );

        const newAudioURL = response.data.secure_url;
        await updateDoc(doc(db, "words", wordId), { audioURL: newAudioURL });

        setWords((prevWords) =>
          prevWords.map((word) => (word.id === wordId ? { ...word, audioURL: newAudioURL } : word))
        );
      } catch (error) {
        console.error("Error uploading new audio:", error);
      }
    };
  };

  return (
    <div className="word-list-container">
      <h2>Glossary 📚</h2>

        {/* 🔹 Search Input */}
        <div className="search-cont">
        <input
        type="text"
        placeholder="Search words..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-inp"
      />
        </div>
       

      {/* <div className="word-cont"> */}

      {filteredWords.map((word) => (
        <div key={word.id} className="word-card">
            <div className="left">
            <h3>{word.word}</h3>
            <p dangerouslySetInnerHTML={{ __html: word.description }}></p>
            </div>


            <div className="right">
                {/* Play Audio */}
                {word.audioURL && <audio controls src={word.audioURL}></audio>}

                {/* Replace Audio */}
                <button className="replace-btn" onClick={() => uploadNewAudio(word.id)}>
                Replace Audio
                </button>

                {/* Delete Word */}
                <button className="delete-btn" onClick={() => deleteWord(word.id)}>
                Delete
                </button>
            </div>
          
        </div>
      ))}
      {/* </div> */}

    </div>
  );
}

export default WordList;
