import { useDropzone } from "react-dropzone";
import { Upload, X, Image } from "lucide-react";
import { useState } from "react";

export default function ImageUpload({ onImageUpload, currentImage }) {
  const [preview, setPreview] = useState(currentImage || null);
  
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onImageUpload(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    maxSize: 5242880 // 5MB
  });
  
  const removeImage = () => {
    setPreview(null);
    onImageUpload(null);
  };
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Foto del material
      </label>
      
      {!preview ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
            ${isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400'}`}
        >
          <input {...getInputProps()} />
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          {isDragActive ? (
            <p className="text-emerald-600">Suelta la imagen aquí...</p>
          ) : (
            <>
              <p className="text-gray-600">Arrastra o haz clic para subir una foto</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF hasta 5MB</p>
            </>
          )}
        </div>
      ) : (
        <div className="relative">
          <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}