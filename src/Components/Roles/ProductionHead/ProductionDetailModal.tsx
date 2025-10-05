import React, { useState } from 'react';
import { X, Calendar, User, Cog, Clock, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import type { JobPlan, ProductionStep } from './productionService';

interface JobDetailsModalProps {
  jobs: Array<{ jobPlan: JobPlan; step: ProductionStep }>;
  title: string;
  stepName?: string;
  status?: string;
  onClose: () => void;
}

const ProductionDetailModal: React.FC<JobDetailsModalProps> = ({ jobs, title, stepName, status, onClose }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'start':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'stop':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'planned':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'start':
        return <Clock className="h-4 w-4" />;
      case 'stop':
        return <AlertTriangle className="h-4 w-4" />;
      case 'planned':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not started';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStepDisplayName = (stepName: string) => {
    switch (stepName) {
      case 'Corrugation':
        return 'Corrugation';
      case 'FluteLaminateBoardConversion':
        return 'Flute Lamination';
      case 'Punching':
        return 'Punching';
      case 'SideFlapPasting':
        return 'Flap Pasting';
      default:
        return stepName;
    }
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = 30;
      
      // Colors
      const colors = {
        primary: [41, 128, 185],
        secondary: [52, 73, 94],
        success: [39, 174, 96],
        warning: [241, 196, 15],
        danger: [231, 76, 60],
        light: [249, 250, 251],
        white: [255, 255, 255],
        text: [44, 62, 80],
      };

      // Helper functions
      const drawRect = (x: number, y: number, width: number, height: number, color: number[]) => {
        pdf.setFillColor(color[0], color[1], color[2]);
        pdf.rect(x, y, width, height, 'F');
      };

      // Header
      drawRect(0, 0, pageWidth, 50, colors.primary);
      
      // Company logo area
      drawRect(15, 10, 8, 8, colors.white);
      pdf.setFontSize(6);
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.text('NRC', 19, 15.5, { align: 'center' });
      
      // Company name
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text('NR Containers', pageWidth / 2, 25, { align: 'center' });
      
      // Subtitle
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Production Job Details Report', pageWidth / 2, 35, { align: 'center' });
      
      yPosition = 65;
      
      // Report Header
      drawRect(15, yPosition - 5, pageWidth - 30, 25, colors.secondary);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text(title, 20, yPosition + 5);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Jobs: ${jobs.length}`, 20, yPosition + 15);
      pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, pageWidth - 20, yPosition + 15, { align: 'right' });
      
      yPosition += 35;
      pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      
      // Job details
      jobs.forEach((jobData, index) => {
        const { jobPlan, step } = jobData;
        
        // Check if we need a new page
        if (yPosition > pageHeight - 80) {
          pdf.addPage();
          yPosition = 30;
        }
        
        // Job card
        const cardHeight = 45;
        drawRect(15, yPosition - 2, pageWidth - 30, cardHeight, colors.white);
        pdf.setDrawColor(colors.light[0], colors.light[1], colors.light[2]);
        pdf.setLineWidth(0.5);
        pdf.rect(15, yPosition - 2, pageWidth - 30, cardHeight, 'S');
        
        // Job number
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}. ${jobPlan.nrcJobNo}`, 20, yPosition + 8);
        
        // Step name and status
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Step: ${getStepDisplayName(step.stepName)}`, 20, yPosition + 18);
        pdf.text(`Status: ${step.status.toUpperCase()}`, 20, yPosition + 26);
        
        // Dates
        pdf.text(`Started: ${formatDate(step.startDate)}`, 20, yPosition + 34);
        if (step.endDate) {
          pdf.text(`Completed: ${formatDate(step.endDate)}`, 120, yPosition + 34);
        }
        
        // Machine and operator
        if (step.machineDetails[0]?.machineType) {
          pdf.text(`Machine: ${step.machineDetails[0].machineType}`, 120, yPosition + 18);
        }
        if (step.user) {
          pdf.text(`Operator: ${step.user}`, 120, yPosition + 26);
        }
        
        yPosition += cardHeight + 8;
      });
      
      // Footer
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        drawRect(0, pageHeight - 15, pageWidth, 15, colors.light);
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        
        pdf.text('NR Containers Pvt. Ltd.', 15, pageHeight - 7);
        pdf.text(
          `Generated on ${new Date().toLocaleDateString()}`,
          pageWidth / 2,
          pageHeight - 7,
          { align: 'center' }
        );
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 15, pageHeight - 7, { align: 'right' });
      }
      
      // Save PDF
      const fileName = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#00AEEF] text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              <p className="text-blue-100 mt-1">Total Jobs: {jobs.length}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                <span>{isGeneratingPDF ? 'Generating...' : 'Download PDF'}</span>
              </button>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <Cog className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Found</h3>
              <p className="text-gray-600">No jobs match the selected criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((jobData, index) => {
                const { jobPlan, step } = jobData;
                return (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    {/* Job Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                          {jobPlan.nrcJobNo}
                        </h3>
                        <p className="text-xs text-gray-500 capitalize">
                          Demand: {jobPlan.jobDemand}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(step.status)}`}>
                        {getStatusIcon(step.status)}
                        <span className="ml-1">{step.status}</span>
                      </span>
                    </div>

                    {/* Step Information */}
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Step:</span>
                        <span className="font-medium text-gray-900">{getStepDisplayName(step.stepName)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-500">Step No:</span>
                        <span className="font-medium text-gray-900">{step.stepNo}</span>
                      </div>

                      {step.startDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Started:</span>
                          <span className="font-medium text-gray-900">{formatDate(step.startDate)}</span>
                        </div>
                      )}

                      {step.endDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Completed:</span>
                          <span className="font-medium text-gray-900">{formatDate(step.endDate)}</span>
                        </div>
                      )}

                      {step.user && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Operator:</span>
                          <span className="font-medium text-gray-900">{step.user}</span>
                        </div>
                      )}

                      {step.machineDetails[0]?.machineType && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Machine:</span>
                          <span className="font-medium text-gray-900">{step.machineDetails[0].machineType}</span>
                        </div>
                      )}

                      {step.machineDetails[0]?.unit && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Unit:</span>
                          <span className="font-medium text-gray-900">{step.machineDetails[0].unit}</span>
                        </div>
                      )}
                    </div>

                    {/* Job Plan Info */}
                    <div className="mt-3 pt-3 border-t border-gray-200 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Job Created:</span>
                        <span className="text-gray-600">{formatDate(jobPlan.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionDetailModal;
