import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SessionData, AppConfig } from '../types';

const createCoverPage = async (doc: jsPDF, sessionData: SessionData, config: AppConfig): Promise<void> => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Criar elemento temporário para a capa
  const coverElement = document.createElement('div');
  coverElement.style.width = '210mm';
  coverElement.style.height = '297mm';
  coverElement.style.position = 'absolute';
  coverElement.style.left = '-9999px';
  coverElement.style.fontFamily = 'Arial, sans-serif';
  coverElement.style.color = 'white';
  coverElement.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${config.coverSettings?.backgroundImage || ''})`;
  coverElement.style.backgroundSize = 'cover';
  coverElement.style.backgroundPosition = 'center';
  coverElement.style.backgroundRepeat = 'no-repeat';
  coverElement.style.display = 'flex';
  coverElement.style.flexDirection = 'column';
  coverElement.style.justifyContent = 'space-between';
  coverElement.style.padding = '40px';
  coverElement.style.boxSizing = 'border-box';

  coverElement.innerHTML = `
    <div style="text-align: center;">
      <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 20px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
        RELATÓRIO TERAPÊUTICO
      </h1>
      <div style="font-size: 14px; opacity: 0.9; line-height: 1.6;">
        <p style="margin: 5px 0;">ATENDIMENTO HOLÍSTICO</p>
        <p style="margin: 5px 0;">SISTEMA ARCTURIANO DE CURA MULTIDIMENSIONAL</p>
      </div>
    </div>

    <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
      <div style="width: 120px; height: 120px; border-radius: 50%; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center;">
        <div style="width: 90px; height: 90px; border-radius: 50%; background: linear-gradient(45deg, rgba(255,215,0,0.5), rgba(255,165,0,0.5)); display: flex; align-items: center; justify-content: center; font-size: 32px;">
          ✦
        </div>
      </div>
    </div>

    <div style="font-size: 14px; line-height: 1.8;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span>DATA:</span>
        <span>${new Date(sessionData.sessionDate).toLocaleDateString('pt-BR')}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span>HORÁRIO:</span>
        <span>${sessionData.sessionTime || 'Não informado'}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <span>CLIENTE:</span>
        <span>${sessionData.clientName}</span>
      </div>
      <div style="text-align: right;">
        <p style="font-size: 12px; opacity: 0.75; margin: 0;">Relatório emitido por</p>
        <p style="font-weight: bold; margin: 5px 0 0 0;">${sessionData.therapistName}</p>
      </div>
    </div>
  `;

  document.body.appendChild(coverElement);

  try {
    const canvas = await html2canvas(coverElement, {
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    doc.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
  } catch (error) {
    console.error('Erro ao gerar capa:', error);
    // Fallback para capa simples em caso de erro
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO TERAPÊUTICO', pageWidth / 2, 60, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    let currentY = 100;
    
    doc.text(`Terapeuta: ${sessionData.therapistName}`, 20, currentY);
    currentY += 15;
    doc.text(`Cliente: ${sessionData.clientName}`, 20, currentY);
    currentY += 15;
    doc.text(`Data: ${new Date(sessionData.sessionDate).toLocaleDateString('pt-BR')}`, 20, currentY);
    currentY += 15;
    if (sessionData.sessionTime) {
      doc.text(`Horário: ${sessionData.sessionTime}`, 20, currentY);
    }
  } finally {
    document.body.removeChild(coverElement);
  }
};

export const generatePDF = async (sessionData: SessionData, config: AppConfig): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Função para adicionar texto quebrado
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12): number => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * fontSize * 0.5;
  };

  // Função para adicionar nova página
  const addNewPage = (): void => {
    doc.addPage();
  };

  // CAPA PROFISSIONAL
  await createCoverPage(doc, sessionData, config);

  // PÁGINA DE INTRODUÇÃO
  addNewPage();
  doc.setTextColor(0, 0, 0); // Reset para texto preto
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('INTRODUÇÃO', margin, 40);

  // Substituir [NOME_CLIENTE] pelo nome real
  const introText = config.introductionText.replace(/\[NOME_CLIENTE\]/g, sessionData.clientName);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  addWrappedText(introText, margin, 60, contentWidth);

  // PÁGINAS DAS FREQUÊNCIAS
  const selectedFrequencies = config.frequencies.filter(freq => 
    sessionData.selectedFrequencies.includes(freq.id)
  );

  for (const frequency of selectedFrequencies) {
    addNewPage();
    
    // Título da frequência
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(frequency.title, margin, 40);

    let contentY = 60;

    // Imagem (se existir)
    if (frequency.imageUrl) {
      try {
        // Criar elemento de imagem temporário
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              // Definir tamanho da imagem no PDF
              const imgWidth = 80;
              const imgHeight = 60;
              
              canvas.width = imgWidth * 2;
              canvas.height = imgHeight * 2;
              
              ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
              const imgData = canvas.toDataURL('image/jpeg', 0.8);
              
              doc.addImage(imgData, 'JPEG', margin, contentY, imgWidth, imgHeight);
              contentY += imgHeight + 10;
              resolve(true);
            } catch (error) {
              console.error('Erro ao processar imagem:', error);
              resolve(false);
            }
          };
          
          img.onerror = () => {
            console.error('Erro ao carregar imagem');
            resolve(false);
          };
          
          img.src = frequency.imageUrl;
        });
      } catch (error) {
        console.error('Erro ao adicionar imagem:', error);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('[ Imagem não disponível ]', margin, contentY);
        contentY += 20;
      }
    }

    // Descrição da frequência
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    addWrappedText(frequency.description, margin, contentY, contentWidth);
  }

  // PÁGINA FINAL
  addNewPage();
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CONSIDERAÇÕES FINAIS', margin, 40);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const finalText = `Este relatório apresenta as ${sessionData.selectedFrequencies.length} frequências utilizadas na sessão terapêutica de ${sessionData.clientName}.

Cada frequência foi selecionada com base nas necessidades específicas identificadas durante a avaliação, visando promover o equilíbrio e bem-estar.

Para dúvidas ou esclarecimentos adicionais, entre em contato com o terapeuta responsável.`;

  addWrappedText(finalText, margin, 60, contentWidth);

  // Assinatura
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text(`${sessionData.therapistName}`, margin, pageHeight - 60);
  doc.text('Terapeuta Responsável', margin, pageHeight - 50);

  // Data de emissão
  doc.text(`Relatório emitido em: ${new Date().toLocaleDateString('pt-BR')}`, margin, pageHeight - 30);

  // Salvar o PDF
  const fileName = `relatorio_${sessionData.clientName.replace(/\s+/g, '_')}_${sessionData.sessionDate}.pdf`;
  doc.save(fileName);
};