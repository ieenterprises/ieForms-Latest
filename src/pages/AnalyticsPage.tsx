
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormData } from '../types/form';
import { Analytics } from '../components/Analytics';
import { ArrowLeft } from 'lucide-react';

interface AnalyticsPageProps {
  forms: FormData[];
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ forms }) => {
  const { formId } = useParams();
  const navigate = useNavigate();
  
  const currentForm = forms.find(form => form.id === formId);
  
  if (!currentForm) {
    return <div className="p-6">Form not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold ml-2">Analytics</h1>
      </div>
      
      <Analytics form={currentForm} />
    </div>
  );
};
