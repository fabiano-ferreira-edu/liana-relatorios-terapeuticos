import React, { useState, useEffect } from 'react';
import { Download, Calendar, Clock, User, Users } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from './Auth/AuthProvider';
import { SessionData } from '../types';
import { generatePDF } from '../utils/pdfGenerator';
import { supabase } from '../lib/supabase';

const ReportGenerator: React.FC = () => {
  const { config } = useAppContext();
  const { user } = useAuth();
  const [sessionData, setSessionData] = useState<SessionData>({
    therapistName: '',
    clientName: '',
    sessionDate: '',
    sessionTime: '',
    selectedFrequencies: [],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingTherapistName, setLoadingTherapistName] = useState(true);

  // Carregar nome do terapeuta automaticamente
  useEffect(() => {
    const loadTherapistName = async () => {
      if (!user) {
        setLoadingTherapistName(false);
        return;
      }

      try {
        // Primeiro, tentar obter do perfil do usuário
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        let therapistName = '';

        if (!error && profile?.full_name) {
          therapistName = profile.full_name;
        } else {
          // Fallback: usar dados do auth metadata
          therapistName = user.user_metadata?.full_name || 
                         user.user_metadata?.name || 
                         user.email?.split('@')[0] || 
                         '';
        }

        setSessionData(prev => ({
          ...prev,
          therapistName: therapistName
        }));
      } catch (error) {
        console.error('Erro ao carregar nome do terapeuta:', error);
        // Fallback final: usar email como base
        const fallbackName = user.email?.split('@')[0] || '';
        setSessionData(prev => ({
          ...prev,
          therapistName: fallbackName
        }));
      } finally {
        setLoadingTherapistName(false);
      }
    };

    loadTherapistName();
  }, [user]);

  const handleInputChange = (field: keyof SessionData, value: string) => {
    setSessionData(prev => ({ ...prev, [field]: value }));
  };

  const handleFrequencyToggle = (frequencyId: number) => {
    setSessionData(prev => ({
      ...prev,
      selectedFrequencies: prev.selectedFrequencies.includes(frequencyId)
        ? prev.selectedFrequencies.filter(id => id !== frequencyId)
        : [...prev.selectedFrequencies, frequencyId]
    }));
  };

  const handleGenerateReport = async () => {
    if (!sessionData.therapistName || !sessionData.clientName || !sessionData.sessionDate) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (sessionData.selectedFrequencies.length === 0) {
      alert('Por favor, selecione pelo menos uma frequência.');
      return;
    }

    setIsGenerating(true);
    try {
      await generatePDF(sessionData, config);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar o relatório. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gerador de Relatórios Terapêuticos
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Preencha os dados da sessão e selecione as frequências utilizadas para gerar um relatório personalizado em PDF.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <User className="h-5 w-5 mr-2 text-blue-600" />
          Dados da Sessão
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Terapeuta *
            </label>
            <div className="relative">
              <input
                type="text"
                value={sessionData.therapistName}
                onChange={(e) => handleInputChange('therapistName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Digite o nome do terapeuta"
                disabled={loadingTherapistName}
              />
              {loadingTherapistName && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            {sessionData.therapistName && !loadingTherapistName && (
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <User className="h-3 w-3 mr-1" />
                Preenchido automaticamente do seu perfil
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Cliente *
            </label>
            <input
              type="text"
              value={sessionData.clientName}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Digite o nome do cliente"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data do Atendimento *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={sessionData.sessionDate}
                onChange={(e) => handleInputChange('sessionDate', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora do Atendimento
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="time"
                value={sessionData.sessionTime}
                onChange={(e) => handleInputChange('sessionTime', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Users className="h-5 w-5 mr-2 text-blue-600" />
          Seleção de Frequências
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {config.frequencies.map((frequency) => (
            <div
              key={frequency.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                sessionData.selectedFrequencies.includes(frequency.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleFrequencyToggle(frequency.id)}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {frequency.title}
                </span>
                <input
                  type="checkbox"
                  checked={sessionData.selectedFrequencies.includes(frequency.id)}
                  onChange={() => handleFrequencyToggle(frequency.id)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          {sessionData.selectedFrequencies.length} frequência(s) selecionada(s)
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Gerando Relatório...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Gerar Relatório PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReportGenerator;