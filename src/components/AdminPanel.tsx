import React, { useState } from 'react';
import { Save, Upload, Image, Edit3, Check, X, Palette, GalleryVertical as Gallery } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import CoverDesigner from './CoverDesigner';
import ImageUploadModal from './ImageUpload/ImageUploadModal';
import ImageGallery from './ImageUpload/ImageGallery';

const AdminPanel: React.FC = () => {
  const { config, updateIntroductionText, updateFrequency, uploadFrequencyImage } = useAppContext();
  const [introText, setIntroText] = useState(config.introductionText);
  const [editingFrequency, setEditingFrequency] = useState<number | null>(null);
  const [editingValues, setEditingValues] = useState<{[key: number]: {title: string, description: string}}>({});
  const [showCoverDesigner, setShowCoverDesigner] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState<number | null>(null);
  const [showImageGallery, setShowImageGallery] = useState(false);

  const handleSaveIntroduction = async () => {
    await updateIntroductionText(introText);
    alert('Texto de introdução salvo com sucesso!');
  };

  const handleImageUpload = (frequencyId: number, file: File) => {
    if (file.type.startsWith('image/')) {
      uploadFrequencyImage(frequencyId, file);
    } else {
      alert('Por favor, selecione um arquivo de imagem válido.');
    }
  };

  const startEditing = (frequency: { id: number; title: string; description: string }) => {
    setEditingFrequency(frequency.id);
    setEditingValues({
      ...editingValues,
      [frequency.id]: { title: frequency.title, description: frequency.description }
    });
  };

  const saveFrequency = async (frequencyId: number) => {
    const values = editingValues[frequencyId];
    if (values) {
      await updateFrequency(frequencyId, values);
      setEditingFrequency(null);
    }
  };

  const cancelEditing = () => {
    setEditingFrequency(null);
  };

  const handleImageSelect = (frequencyId: number, url: string) => {
    updateFrequency(frequencyId, { imageUrl: url });
    setShowImageUpload(null);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Painel de Configuração
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Configure o texto de introdução, personalize a capa e gerencie as frequências que serão incluídas nos relatórios.
        </p>
      </div>

      {/* Galeria de Imagens */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Gallery className="h-5 w-5 mr-2 text-blue-600" />
            Galeria de Imagens
          </h2>
          <button
            onClick={() => setShowImageGallery(!showImageGallery)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
          >
            <Gallery className="h-4 w-4 mr-2" />
            {showImageGallery ? 'Ocultar Galeria' : 'Ver Galeria'}
          </button>
        </div>

        {showImageGallery && <ImageGallery />}
      </div>

      {/* Designer de Capa */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Palette className="h-5 w-5 mr-2 text-blue-600" />
          Design da Capa
        </h2>
        
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">Personalizar Capa do Relatório</h3>
            <p className="text-sm text-gray-600 mt-1">
              Escolha a imagem de fundo e personalize a aparência da capa dos seus relatórios
            </p>
          </div>
          <button
            onClick={() => setShowCoverDesigner(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center"
          >
            <Palette className="h-4 w-4 mr-2" />
            Personalizar Capa
          </button>
        </div>

        {config.coverSettings?.backgroundImage && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Imagem atual da capa:</p>
            <img
              src={config.coverSettings.backgroundImage}
              alt="Capa atual"
              className="w-32 h-24 object-cover rounded-lg border border-gray-200"
            />
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Edit3 className="h-5 w-5 mr-2 text-blue-600" />
          Texto de Introdução
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texto padrão que aparecerá na introdução do relatório
            </label>
            <textarea
              value={introText}
              onChange={(e) => setIntroText(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Digite o texto de introdução..."
            />
          </div>
          
          <div className="text-sm text-gray-600">
            <p><strong>Dica:</strong> Use <code>[NOME_CLIENTE]</code> no texto para que seja substituído automaticamente pelo nome do cliente.</p>
          </div>
          
          <button
            onClick={handleSaveIntroduction}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Introdução
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Image className="h-5 w-5 mr-2 text-blue-600" />
          Gerenciamento de Frequências
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {config.frequencies.map((frequency) => (
            <div key={frequency.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingFrequency === frequency.id ? (
                    <input
                      type="text"
                      value={editingValues[frequency.id]?.title || frequency.title}
                      onChange={(e) => setEditingValues({
                        ...editingValues,
                        [frequency.id]: {
                          ...editingValues[frequency.id],
                          title: e.target.value
                        }
                      })}
                      className="text-lg font-medium border-b border-gray-300 focus:border-blue-500 outline-none"
                    />
                  ) : (
                    frequency.title
                  )}
                </h3>
                
                <div className="flex space-x-2">
                  {editingFrequency === frequency.id ? (
                    <>
                      <button
                        onClick={() => saveFrequency(frequency.id)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEditing(frequency)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  {editingFrequency === frequency.id ? (
                    <textarea
                      value={editingValues[frequency.id]?.description || frequency.description}
                      onChange={(e) => setEditingValues({
                        ...editingValues,
                        [frequency.id]: {
                          ...editingValues[frequency.id],
                          description: e.target.value
                        }
                      })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">{frequency.description}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagem
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(frequency.id, file);
                        }
                      }}
                      className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                    />
                    <button
                      onClick={() => setShowImageUpload(frequency.id)}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-4 rounded-lg transition-colors flex items-center"
                    >
                      <Gallery className="h-4 w-4 mr-2" />
                      Galeria
                    </button>
                    {frequency.imageUrl && (
                      <div className="flex items-center space-x-2">
                        <img
                          src={frequency.imageUrl}
                          alt={frequency.title}
                          className="h-12 w-12 object-cover rounded-lg border border-gray-200"
                        />
                        <span className="text-sm text-green-600">✓ Imagem carregada</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal do Designer de Capa */}
      {showCoverDesigner && (
        <CoverDesigner onClose={() => setShowCoverDesigner(false)} />
      )}

      {/* Modal de Upload de Imagem */}
      {showImageUpload && (
        <ImageUploadModal
          isOpen={true}
          onClose={() => setShowImageUpload(null)}
          onUploadSuccess={(url) => handleImageSelect(showImageUpload, url)}
          metadata={{ frequencyId: showImageUpload }}
          title={`Upload para Frequência ${showImageUpload}`}
        />
      )}
    </div>
  );
};

export default AdminPanel;