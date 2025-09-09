'use client';

import { FileUpload } from '@/types/form';
import { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';

interface StepDocumentosProps {
  uploadedFiles: FileUpload[];
  setUploadedFiles: (files: FileUpload[]) => void;
  shouldShowSpouseStep: boolean;
}

export function StepDocumentos({ uploadedFiles, setUploadedFiles, shouldShowSpouseStep }: StepDocumentosProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectCategory = (filename: string) => {
    const lowerName = filename.toLowerCase();
    
    if (lowerName.includes('conjuge') || lowerName.includes('cônjuge')) {
      if (lowerName.includes('rg')) return 'rg-conjuge';
      if (lowerName.includes('cpf')) return 'cpf-conjuge';
      if (lowerName.includes('renda')) return 'renda-conjuge';
    }
    
    if (lowerName.includes('rg')) return 'rg';
    if (lowerName.includes('cpf')) return 'cpf';
    if (lowerName.includes('residencia') || lowerName.includes('comprovante')) return 'residencia';
    if (lowerName.includes('renda') || lowerName.includes('holerite')) return 'renda';
    if (lowerName.includes('casamento') || lowerName.includes('certidao')) return 'casamento';
    
    return 'outros';
  };

  const handleFiles = (files: FileList | File[]) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    Array.from(files).forEach(file => {
      if (!validTypes.includes(file.type)) {
        alert(`Arquivo ${file.name} não é suportado. Use PDF, JPG, JPEG ou PNG.`);
        return;
      }

      if (file.size > maxSize) {
        alert(`Arquivo ${file.name} excede o limite de 10MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Result = e.target?.result as string;
        console.log(`📎 Arquivo processado: ${file.name}`);
        console.log(`📊 Base64 length: ${base64Result?.length}`);
        console.log(`📄 Base64 preview: ${base64Result?.substring(0, 100)}...`);
        
        const fileObj: FileUpload = {
          id: Date.now() + Math.random().toString(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          category: detectCategory(file.name),
          base64: base64Result
        };

        console.log('📋 FileObj criado:', {
          name: fileObj.name,
          type: fileObj.type,
          category: fileObj.category,
          hasBase64: !!fileObj.base64,
          base64Length: fileObj.base64?.length
        });

        setUploadedFiles([...uploadedFiles, fileObj]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(uploadedFiles.filter(f => f.id !== fileId));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Documentos</h2>
        <p className="text-gray-600">Anexe os documentos necessários (opcional)</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Documentos necessários:</strong> RG, CPF, Comprovante de Residência, Comprovante de Renda
          {shouldShowSpouseStep && (
            <span>, Certidão de Casamento, Documentos do Cônjuge</span>
          )}
        </p>
      </div>

      <div
        className={`
          border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer
          ${isDragOver 
            ? 'border-yellow-400 bg-yellow-50' 
            : 'border-gray-300 hover:border-yellow-400 hover:bg-gray-50'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Arraste seus documentos aqui</h3>
        <p className="text-gray-600 mb-4">ou clique para selecionar arquivos</p>
        <button
          type="button"
          className="bg-[#FFC629] text-[#1A1A1A] px-6 py-2 rounded-lg hover:bg-[#FFD93D] transition-colors font-medium"
        >
          Selecionar Arquivos
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Formatos: PDF, JPG, PNG • Máximo 10MB por arquivo
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Arquivos anexados ({uploadedFiles.length}):</h4>
          <div className="space-y-2">
            {uploadedFiles.map(file => (
              <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3">
                  {file.type.includes('pdf') ? (
                    <FileText className="h-5 w-5 text-red-500" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-blue-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {Math.round(file.size / 1024)} KB • {file.category}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}