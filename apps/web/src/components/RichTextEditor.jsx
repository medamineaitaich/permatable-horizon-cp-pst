import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, Italic, Underline, List, ListOrdered, 
  Link as LinkIcon, Image as ImageIcon, Undo, Redo, 
  RemoveFormatting, Type, PaintBucket
} from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import pb from '../lib/pocketbaseClient';
import { toast } from 'sonner';

const RichTextEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  // Initialize content
  useEffect(() => {
    if (editorRef.current && value !== undefined && value !== editorRef.current.innerHTML) {
      // Only update if the value is actually different to avoid cursor jumping
      if (value !== editorRef.current.innerHTML) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const handleInput = () => {
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command, commandValue = null) => {
    document.execCommand(command, false, commandValue);
    editorRef.current?.focus();
    handleInput();
  };

  const handleFormatBlock = (format) => {
    executeCommand('formatBlock', format);
  };

  const handleLink = () => {
    const url = prompt('Enter link URL:', 'https://');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const loadingToast = toast.loading('Uploading image...');

    try {
      // Create a temporary draft post to store the image in PocketBase
      const formData = new FormData();
      formData.append('title', `Image Upload - ${Date.now()}`);
      formData.append('slug', `img-${Date.now()}`);
      formData.append('featured_image', file);
      formData.append('published', false);

      const record = await pb.collection('blog_posts').create(formData, { $autoCancel: false });
      const url = pb.files.getUrl(record, record.featured_image);
      
      executeCommand('insertImage', url);
      toast.success('Image inserted', { id: loadingToast });
    } catch (error) {
      console.error('Failed to upload image to PocketBase:', error);
      
      // Fallback to base64 if PocketBase upload fails
      const reader = new FileReader();
      reader.onload = (event) => {
        executeCommand('insertImage', event.target.result);
        toast.success('Image inserted (local)', { id: loadingToast });
      };
      reader.onerror = () => {
        toast.error('Failed to insert image', { id: loadingToast });
      };
      reader.readAsDataURL(file);
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const ToolbarButton = ({ icon: Icon, onClick, title }) => (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-foreground"
      onClick={onClick}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  return (
    <div className={`border rounded-xl overflow-hidden bg-background transition-colors duration-200 ${isFocused ? 'border-primary ring-1 ring-primary/20' : 'border-border'}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/30">
        <Select onValueChange={handleFormatBlock} defaultValue="P">
          <SelectTrigger className="w-[130px] h-8 bg-background">
            <SelectValue placeholder="Format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="P">Paragraph</SelectItem>
            <SelectItem value="H1">Heading 1</SelectItem>
            <SelectItem value="H2">Heading 2</SelectItem>
            <SelectItem value="H3">Heading 3</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton icon={Bold} onClick={() => executeCommand('bold')} title="Bold" />
        <ToolbarButton icon={Italic} onClick={() => executeCommand('italic')} title="Italic" />
        <ToolbarButton icon={Underline} onClick={() => executeCommand('underline')} title="Underline" />
        
        <div className="w-px h-6 bg-border mx-1" />

        <div className="flex items-center gap-1 relative" title="Text Color">
          <Type className="h-4 w-4 text-muted-foreground absolute left-2 pointer-events-none" />
          <input 
            type="color" 
            className="w-8 h-8 opacity-0 cursor-pointer absolute inset-0" 
            onChange={(e) => executeCommand('foreColor', e.target.value)}
          />
          <div className="w-8 h-8 rounded hover:bg-muted flex items-center justify-center cursor-pointer" />
        </div>

        <div className="flex items-center gap-1 relative" title="Background Color">
          <PaintBucket className="h-4 w-4 text-muted-foreground absolute left-2 pointer-events-none" />
          <input 
            type="color" 
            className="w-8 h-8 opacity-0 cursor-pointer absolute inset-0" 
            onChange={(e) => executeCommand('hiliteColor', e.target.value)}
          />
          <div className="w-8 h-8 rounded hover:bg-muted flex items-center justify-center cursor-pointer" />
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton icon={List} onClick={() => executeCommand('insertUnorderedList')} title="Bullet List" />
        <ToolbarButton icon={ListOrdered} onClick={() => executeCommand('insertOrderedList')} title="Numbered List" />
        
        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton icon={LinkIcon} onClick={handleLink} title="Insert Link" />
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground relative"
          title="Insert Image"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleImageUpload} 
        />

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton icon={Undo} onClick={() => executeCommand('undo')} title="Undo" />
        <ToolbarButton icon={Redo} onClick={() => executeCommand('redo')} title="Redo" />
        <ToolbarButton icon={RemoveFormatting} onClick={() => executeCommand('removeFormat')} title="Clear Formatting" />
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        className="prose prose-sm sm:prose-base max-w-none p-4 min-h-[400px] focus:outline-none text-foreground"
        contentEditable
        onInput={handleInput}
        onBlur={() => {
          setIsFocused(false);
          handleInput();
        }}
        onFocus={() => setIsFocused(true)}
        style={{ outline: 'none' }}
      />
    </div>
  );
};

export default RichTextEditor;
