'use client';

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { useMemo, useRef } from 'react';

// Use require for the module as it might not have types or be ESM compatible
const ReactQuill = dynamic(async () => {
  const { default: RQ, Quill } = await import('react-quill-new');
  const { default: ImageResize } = await import('quill-image-resize-module-react');
  Quill.register('modules/imageResize', ImageResize);
  return function ForwardRef(props: any) {
    return <RQ {...props} />;
  };
}, { ssr: false });

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const quillRef = useRef<any>(null);

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) throw new Error('Upload failed');
          const data = await res.json();
          
          const quill = quillRef.current?.getEditor();
          const range = quill?.getSelection();
          if (quill && range) {
             quill.insertEmbed(range.index, 'image', data.url);
          }
        } catch (error) {
          console.error('Image upload failed', error);
          alert('Failed to upload image');
        }
      }
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
    imageResize: {
      parchment: null, 
      modules: ['Resize', 'DisplaySize']
    }
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list',
    'link', 'image'
  ];

  return (
    <div className="h-[500px] mb-12">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        className="h-[calc(100%-42px)] bg-white rounded-lg" 
      />
    </div>
  );
}
