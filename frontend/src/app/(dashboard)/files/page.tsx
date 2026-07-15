'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import {
  Files, Upload, Search, Download,
  Trash2, FileText, Image, Archive,
  Film, Music, Code, File,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/slices/authStore';

type FileItem = {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedBy: string;
  createdAt: string;
  url?: string;
};

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Film;
  if (type.startsWith('audio/')) return Music;
  if (type.includes('pdf') || type.includes('text')) return FileText;
  if (type.includes('zip') || type.includes('rar')) return Archive;
  if (type.includes('javascript') || type.includes('typescript') || type.includes('json')) return Code;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function FilesPage() {
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'project-design.pdf',
      size: 2048000,
      type: 'application/pdf',
      uploadedBy: 'Admin User',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'logo.png',
      size: 512000,
      type: 'image/png',
      uploadedBy: 'Admin User',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'api-docs.json',
      size: 128000,
      type: 'application/json',
      uploadedBy: 'John Developer',
      createdAt: new Date().toISOString(),
    },
  ]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newFile: FileItem = {
        id: Date.now().toString() + i,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedBy: user?.name || 'Unknown',
        createdAt: new Date().toISOString(),
      };

      setFiles((prev) => [newFile, ...prev]);
    }

    setUploading(false);
    toast.success(selectedFiles.length + ' file(s) uploaded successfully!');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (id: string, name: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    toast.success(name + ' deleted');
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Files className="w-7 h-7" /> Files
          </h1>
          <p className="text-muted-foreground">{files.length} files uploaded</p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept="*/*"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            loading={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Files'}
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border bg-card text-sm focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      {filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed rounded-xl">
          <Files className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">
            {search ? 'No files found' : 'No files yet'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? 'Try different search' : 'Upload files to get started'}
          </p>
          {!search && (
            <Button className="mt-4" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" /> Upload Files
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filteredFiles.map((file) => {
              const Icon = getFileIcon(file.type);
              return (
                <div
                  key={file.id}
                  className="p-4 rounded-lg border hover:shadow-md transition group relative"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      <p className="text-xs text-muted-foreground">{file.uploadedBy}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(file.createdAt)}</p>
                    </div>
                  </div>

                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => {
                        if (file.url) {
                          window.open(file.url, '_blank');
                        } else {
                          toast.info('Download not available for demo files');
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-accent"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(file.id, file.name)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div
        className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary transition cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const droppedFiles = e.dataTransfer.files;
          if (fileInputRef.current) {
            const dt = new DataTransfer();
            for (let i = 0; i < droppedFiles.length; i++) {
              dt.items.add(droppedFiles[i]);
            }
            fileInputRef.current.files = dt.files;
            fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }}
      >
        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm font-medium">Drag and drop files here</p>
        <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
      </div>
    </div>
  );
}