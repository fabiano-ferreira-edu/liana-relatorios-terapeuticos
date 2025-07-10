import React, { useState } from 'react';
import { Upload, Image, Eye, Save } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface CoverDesignerProps {
  onClose: () => void;
}

const CoverDesigner: React.FC<CoverDesignerProps> = ({ onClose }) => {
  const { config, updateCoverSettings } = useAppContext();
  const [selectedBackground, setSelectedBackground] = useState(config.coverSettings?.backgroundImage || 'default');
  const [customImage, setCustomImage] = useState<string | null>(null);

  // Imagens pré-definidas com URLs do Pexels
  const predefinedBackgrounds = [
    {
      id: 'mandala',
      name: 'Mandala Dourada',
      url: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Mandala dourada com padrões geométricos sagrados'
    },
    {
      id: 'nature',
      name: 'Natureza Zen',
      url: 'https://images.pexels.com/photos/355321/pexels-photo-355321.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Paisagem natural serena com tons suaves'
    },
    {
      id: 'lotus',
      name: 'Flor de Lótus',
      url: 'https://images.pexels.com/photos/1263986/pexels-photo-1263986.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Flor de lótus em águas tranquilas'
    },
    {
      id: 'crystals',
      name: 'Cristais Energéticos',
      url: 'https://images.pexels.com/photos/1121123/pexels-photo-1121123.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Cristais e pedras em tons harmoniosos'
    },
    {
      id: 'sacred',
      name: 'Geometria Sagrada',
      url: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Padrões de geometria sagrada em tons dourados'
    },
    {
      id: 'meditation',
      name: 'Meditação',
      url: 'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Ambiente de meditação com velas e serenidade'
    }
  ];

  const handleCustomImageUpload = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setCustomImage(imageUrl);
        setSelectedBackground('custom');
      };
      reader.readAsDataURL(file);
    } else {
      alert('Por favor, selecione um arquivo de imagem válido.');
    }
  };

  const handleSave = () => {
    const backgroundImage = selectedBackground === 'custom' ? customImage : 
      predefinedBackgrounds.find(bg => bg.id === selectedBackground)?.url || '';
    
    updateCoverSettings({
      backgroundImage,
      backgroundType: selectedBackground
    });
    
    alert('Configurações da capa salvas com sucesso!');
    onClose();
  };

  const getPreviewImage = () => {
    if (selectedBackground === 'custom' && customImage) {
      return customImage;
    }
    return predefinedBackgrounds.find(bg => bg.id === selectedBackground)?.url || '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Image className="h-6 w-6 mr-2 text-blue-600" />
              Designer de Capa
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Personalize a aparência da capa dos seus relatórios terapêuticos
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Seleção de Imagem */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Escolha a Imagem de Fundo
              </h3>
              
              {/* Upload de Imagem Personalizada */}
              <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                <div className="text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Envie sua própria imagem
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleCustomImageUpload(file);
                      }
                    }}
                    className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                  />
                </div>
              </div>

              {/* Imagens Pré-definidas */}
              <div className="grid grid-cols-2 gap-3">
                {predefinedBackgrounds.map((bg) => (
                  <div
                    key={bg.id}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:shadow-md ${
                      selectedBackground === bg.id
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedBackground(bg.id)}
                  >
                    <img
                      src={bg.url}
                      alt={bg.name}
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-2 text-white">
                        <p className="text-xs font-medium">{bg.name}</p>
                      </div>
                    </div>
                    {selectedBackground === bg.id && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                        <Eye className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Imagem Personalizada */}
              {customImage && (
                <div
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:shadow-md mt-3 ${
                    selectedBackground === 'custom'
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedBackground('custom')}
                >
                  <img
                    src={customImage}
                    alt="Imagem personalizada"
                    className="w-full h-24 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-2 text-white">
                      <p className="text-xs font-medium">Imagem Personalizada</p>
                    </div>
                  </div>
                  {selectedBackground === 'custom' && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                      <Eye className="h-3 w-3" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Preview da Capa */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Visualização da Capa
            </h3>
            
            <div className="bg-gray-100 rounded-lg p-4">
              <div 
                className="relative w-full aspect-[3/4] rounded-lg overflow-hidden shadow-lg"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${getPreviewImage()})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                {/* Conteúdo da Capa */}
                <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
                  {/* Cabeçalho */}
                  <div className="text-center">
                    <h1 className="text-xl font-bold mb-2 text-shadow">
                      RELATÓRIO TERAPÊUTICO
                    </h1>
                    <div className="text-sm opacity-90">
                      <p>ATENDIMENTO HOLÍSTICO</p>
                      <p>SISTEMA ARCTURIANO DE CURA MULTIDIMENSIONAL</p>
                    </div>
                  </div>

                  {/* Área Central - Espaço para logo/mandala */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300/50 to-orange-400/50 flex items-center justify-center">
                        <div className="text-2xl">✦</div>
                      </div>
                    </div>
                  </div>

                  {/* Rodapé com informações */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>DATA:</span>
                      <span>[Data do Atendimento]</span>
                    </div>
                    <div className="flex justify-between">
                      <span>HORÁRIO:</span>
                      <span>[Horário]</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CLIENTE:</span>
                      <span>[Nome do Cliente]</span>
                    </div>
                    <div className="mt-4 text-right">
                      <p className="text-xs opacity-75">Relatório emitido por</p>
                      <p className="font-medium">[Nome do Terapeuta]</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
              <p><strong>Nota:</strong> Os campos entre colchetes serão preenchidos automaticamente com os dados da sessão durante a geração do relatório.</p>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoverDesigner;