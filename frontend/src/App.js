import React, { useState } from "react";
import axios from "axios";
import "./index.css";

const initialResume = {
  name: "John Doe",
  summary: "Experienced developer...",
  experience: ["Software Engineer at X", "Intern at Y"],
  education: ["BSc in CS - ABC University"],
  projects: ["Portfolio Website", "Resume Builder App"],
  skills: ["React", "FastAPI", "Tailwind"],
  certifications: ["AWS Certified Developer"],
  hobbies: ["Chess", "Travel"]
};

function App() {
  const [resume, setResume] = useState(initialResume);
  const [uploading, setUploading] = useState(false);

  const handleChange = (field, value) => {
    setResume({ ...resume, [field]: value });
  };

  const handleListChange = (field, index, value) => {
    const updatedList = [...resume[field]];
    updatedList[index] = value;
    setResume({ ...resume, [field]: updatedList });
  };

  const addItem = (field) => {
    setResume({ ...resume, [field]: [...resume[field], ""] });
  };

  const removeItem = (field, index) => {
    const updatedList = resume[field].filter((_, i) => i !== index);
    setResume({ ...resume, [field]: updatedList });
  };

  const enhanceSection = async (field) => {
    const content = resume[field];
    const text = Array.isArray(content) ? content.join(" | ") : content;

    const response = await axios.post("http://localhost:8000/ai-enhance", {
      section: field,
      content: text,
    });

    let improved = response.data.enhanced_content;

    if (Array.isArray(content)) {
      const cleaned = improved
        .split(" | ")
        .map(item => item.trim())
        .filter(item => item !== "");
      setResume({ ...resume, [field]: cleaned });
    } else {
      setResume({ ...resume, [field]: improved.trim() });
    }
  };

  const saveResume = async () => {
    await axios.post("http://localhost:8000/save-resume", resume);
    alert("Resume saved!");
  };

  const downloadResume = () => {
    const blob = new Blob([JSON.stringify(resume, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.json";
    a.click();
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)) {
      alert("Only PDF and DOCX files are supported.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const response = await axios.post("http://localhost:8000/upload-resume", formData);
      const parsed = response.data.content || "Parsed summary from file...";

      setResume({
        name: "Parsed Name",
        summary: parsed,
        experience: ["Parsed experience 1", "Parsed experience 2"],
        education: ["Parsed education"],
        projects: ["Parsed project 1"],
        skills: ["Parsed skill 1", "Parsed skill 2"],
        certifications: ["Parsed certification"],
        hobbies: ["Parsed hobby"],
      });
    } catch (err) {
      alert("Failed to upload or parse file.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };


    return (
  <div className="app-container">
    {/* LEFT: Resume Editor */}
    <div className="editor">
      <h1>📄 Resume Editor</h1>

      <div className="upload">
        <label>Upload Resume (.pdf or .docx):</label>
        <input type="file" accept=".pdf,.docx" onChange={handleUpload} />
        {uploading && <p>Uploading and parsing file...</p>}
      </div>

      <label>Name:</label>
      <input value={resume.name} onChange={(e) => handleChange("name", e.target.value)} /><br />

      <label>Summary:</label>
      <textarea value={resume.summary} onChange={(e) => handleChange("summary", e.target.value)} />
      <button onClick={() => enhanceSection("summary")}>Enhance with AI</button>

      {["experience", "education", "projects"].map((field) => (
        <div key={field} className="section section-spaced">
          <h3>{field.charAt(0).toUpperCase() + field.slice(1)}</h3>
          {Array.isArray(resume[field]) && resume[field].map((item, idx) => (
            <div key={idx} className="list-item">
              <textarea
                rows="2"
                value={item}
                onChange={(e) => handleListChange(field, idx, e.target.value)}
              />
              <button onClick={() => removeItem(field, idx)}>Remove</button>
            </div>
          ))}
          <button onClick={() => addItem(field)}>Add</button>
          <button onClick={() => enhanceSection(field)}>Enhance with AI</button>
        </div>
      ))}

      {["skills", "certifications", "hobbies"].map((field) => (
        <div key={field} className="section">
          <h3>{field.charAt(0).toUpperCase() + field.slice(1)}</h3>
          {Array.isArray(resume[field]) && resume[field].map((item, idx) => (
            <div key={idx} className="list-item">
              <input
                value={item}
                onChange={(e) => handleListChange(field, idx, e.target.value)}
              />
              <button onClick={() => removeItem(field, idx)}>Remove</button>
            </div>
          ))}
          <button onClick={() => addItem(field)}>Add</button>
          <button onClick={() => enhanceSection(field)}>Enhance with AI</button>
        </div>
      ))}

      <div className="buttons">
        <button onClick={saveResume}>💾 Save Resume</button>
        <button onClick={downloadResume}>⬇️ Download Resume</button>
      </div>
    </div>

    {/* RIGHT: Resume Preview */}
    <div className="preview-panel">
      <h2>🔍 Resume Preview</h2>
      <div className="resume-preview">
        <h1 className="preview-name">{resume.name}</h1>

        <section>
          <h2>Summary</h2>
          <p>{resume.summary}</p>
        </section>

        <section>
          <h2>Experience</h2>
          <ul>
            {resume.experience.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </section>

        <section>
          <h2>Education</h2>
          <ul>
            {resume.education.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </section>

        <section>
          <h2>Projects</h2>
          <ul>
            {resume.projects.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </section>

        <section>
          <h2>Skills</h2>
          <p>{resume.skills.join(", ")}</p>
        </section>

        <section>
          <h2>Certifications</h2>
          <p>{resume.certifications.join(", ")}</p>
        </section>

        <section>
          <h2>Hobbies</h2>
          <p>{resume.hobbies.join(", ")}</p>
        </section>
      </div>
    </div>
  </div>
);

  
}

export default App;
