import React, { useState, useEffect } from 'react';
import { Trash2, Edit3, Image as ImageIcon, Plus } from 'lucide-react';
import { storageService } from '../../lib/storage';
import ImageUploadModal from './ImageUploadModal';

interface ImageGalleryProps {
  onImageSelect?: (url: string) => void;
  frequencyId?: number;
  showUpload?: boolean;
}

interface UserImage {
  id: string;
  image_path: string;
  image_name: string;
  image_type: string;
  file_size: number;
  frequency_id: number | null;
  is_cover_image: boolean;
  metadata: any;
  created_at: string;
  url: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  onImageSelect,
  frequencyId,
  showUpload = true
}) => {
  const [images, setImages] = useState<UserImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    try {
      const userImages = await storageService.getUserImages();
      setImages(userImages);
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta imagem?')) {
      return;
    }

    const success = await storageService.deleteImage(imageId);
    if (success) {
      setImages(images.filter(img => img.id !== imageId));
    } else {
      alert('Erro ao excluir imagem');
    }
  };

  const handleUploadSuccess = (url: string, path: string) => {
    loadImages(); // Recarregar lista de imagens
  };

  const filteredImages = frequencyId 
    ? images.filter(img => img.frequency_id === frequencyId)
    : images;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando imagens...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <ImageIcon className="h-5 w-5 mr-2 text-blue-600" />
          Galeria de Imagens
        </h3>
        {showUpload && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Imagem
          </button>
        )}
      </div>

      {filteredImages.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhuma imagem encontrada</p>
          {showUpload && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Enviar primeira imagem
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className={`relative group border-2 rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                selectedImage === image.url
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                setSelectedImage(image.url);
                onImageSelect?.(image.url);
              }}
            >
              <img
                src={image.url}
                alt={image.image_name}
                className="w-full h-32 object-cover"
              />
              
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(image.id);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-white text-xs truncate">{image.image_name}</p>
                <p className="text-white/80 text-xs">
                  {(image.file_size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>

              {image.frequency_id && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Freq. {image.frequency_id}
                </div>
              )}

              {image.is_cover_image && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  Capa
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ImageUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={handleUploadSuccess}
        metadata={{ frequencyId }}
      />
    </div>
  );
};

export default ImageGallery;