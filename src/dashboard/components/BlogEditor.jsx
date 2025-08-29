// BlogEditor.jsx
import React, { useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import uploadImage from "../helpers/uploadImage";
import Quill from 'quill';
import ImageResize from 'quill-image-resize-module-react';
Quill.register('modules/imageResize', ImageResize);

// Custom image handler with dropdown position control
const imageHandler = function () {
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "image/*");
  input.click();

  input.onchange = async () => {
    const file = input.files[0];
    if (file) {
      const uploaded = await uploadImage(file);
      if (uploaded?.url) {
        const range = this.quill.getSelection(true);
        const imageTag = `<div style="text-align:$
          {position === 'left' ? 'left' : position === 'right' ? 'right' : 'center'}">
          <img src="${uploaded.url}" style="max-width: 100%; height: auto;" />
        </div>`;
        this.quill.clipboard.dangerouslyPasteHTML(range.index, imageTag);
      }
    }
  };
};

const modules = {
  toolbar: {
    container: [
      [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      
      // Text style
      ["bold", "italic", "underline", "strike", "blockquote", "code-block"],
      
      // Lists
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      
      // Alignment
      [{ 'align': [] }],
      
      // Media
      ["link", "image"],
      
      // Colors
      [{ 'color': [] }, { 'background': [] }],
      
      // Cleaning
      ["clean"],
    ],
    handlers: {
      image: imageHandler,
    },
  },
  imageResize: {
    parchment: Quill.import('parchment'),
    modules: [ 'Resize', 'DisplaySize', 'Toolbar' ]
  }
};


const BlogEditor = ({ value, onChange }) => {
  return (
    <div className="space-y-4">
      <ReactQuill
        value={value}
        onChange={onChange}
        modules={modules}
        theme="snow"
        placeholder="Write your blog content here..."
        className="bg-white rounded h-[400px]"
      />
    </div>
  );
};

export default BlogEditor;
