import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormResponse, FormData } from '../types/form';
import { FormField } from '../components/FormField';
import { calculateProgress } from '../utils/progressCalculator';
import { CheckCircle, XCircle, ArrowLeft, Send } from 'lucide-react';

interface PreviewPageProps {
  forms: FormData[];
  setForms: React.Dispatch<React.SetStateAction<FormData[]>>;
}

export const PreviewPage: React.FC<PreviewPageProps> = ({ forms, setForms }) => {
  const [responses, setResponses] = useState<Record<string, string | string[] | number | Date>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>('');
  const { formId } = useParams();
  const navigate = useNavigate();

  const currentForm = forms.find(form => form.id === formId);

  if (!currentForm) {
    return <div className="p-6">Form not found</div>;
  }

  const checkPreviousSubmission = (email: string) => {
    return currentForm.responses.some(response => 
      response.answers.email === email
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let emailToStore = '';
    // Check email if required
    if (currentForm.settings.emailCollection !== 'do_not_collect') {
      const email = responses['email'] as string;
      if (!email || !email.includes('@')) {
        alert('Please enter a valid email address');
        return;
      }
      emailToStore = email;
      // If email collection is verified, we would verify here
      if (currentForm.settings.emailCollection === 'verified') {
        if (checkPreviousSubmission(email)) {
          alert('You have already submitted a response with this email');
          return;
        }
      }
    }

    // Create new response object
    const newResponse: FormResponse = {
      id: Math.random().toString(36).substring(2),
      formId: currentForm.id,
      email: responses.email as string || '',
      answers: responses,
      submittedAt: new Date().toISOString(),
    };

    // Update form with new response
    const updatedForm = {
      ...currentForm,
      responses: [...currentForm.responses, newResponse]
    };

    setForms(prev => prev.map(form => form.id === formId ? updatedForm : form));

    // Store the submitted email for checking future submissions
    setSubmittedEmail(emailToStore);
    setHasSubmitted(true);

    // Clear responses
    setResponses({});
  };

  const handleStartNewResponse = () => {
    if (currentForm.settings.limitOneResponse && submittedEmail) {
      if (checkPreviousSubmission(submittedEmail)) {
        alert('You have already submitted a response to this form.');
        return;
      }
    }

    setResponses({});
    setHasSubmitted(false);
  };

  const handleShare = async () => {
    if (!currentForm) return;

    try {
      // Create a shareable URL for this form with respondent parameter
      const shareableUrl = `${window.location.origin}/form/${currentForm.id}?respondent=true`;

      await navigator.clipboard.writeText(shareableUrl);
      alert('Form link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing', error);
      alert('Failed to copy the link. Please try again.');
    }
  };


  if (hasSubmitted) {
    return (
      <div className={`
        max-w-4xl mx-auto themed-form rounded-lg shadow-md p-6 text-center
        ${currentForm.settings.theme.style}
        ${currentForm.settings.theme.darkMode ? 'theme-dark' : ''}
        theme-${currentForm.settings.theme.primaryColor}
      `}>
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold ml-2">Confirmation</h1>
        </div>

        <div className="flex flex-col items-center justify-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
          <p className="text-lg mb-6">{currentForm.settings.confirmationMessage}</p>

          {currentForm.settings.showSubmitAnother && !currentForm.settings.limitOneResponse && (
            <button
              onClick={handleStartNewResponse}
              className={`px-6 py-3 text-white rounded-md hover:bg-${currentForm.settings.theme.primaryColor}-600 transition-colors bg-${currentForm.settings.theme.primaryColor}-500 flex items-center gap-2`}
            >
              Start New Response
            </button>
          )}

          {currentForm.settings.limitOneResponse && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <div className="flex items-center gap-2 text-gray-600">
                <XCircle className="w-5 h-5" />
                <p>You can only submit one response to this form.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold ml-2">Preview Form</h1>
        </div>
        <button onClick={handleShare} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center">
          <Send className="h-4 w-4 mr-2"/> Share
        </button>
      </div>

      <div 
        className={`
          themed-form rounded-lg shadow-md p-6
          ${currentForm.settings.theme.style || 'classic'}
          ${currentForm.settings.theme.darkMode ? 'theme-dark' : ''}
          theme-${currentForm.settings.theme.primaryColor || 'blue'}
        `}
      >
        <h1 className="mb-6">{currentForm.title}</h1>

        {/* Display custom logo if present */}
        {currentForm.settings.theme.logo && (
          <div className={`mb-6 text-${currentForm.settings.theme.logo.alignment}`}>
            <img 
              src={currentForm.settings.theme.logo.url} 
              alt="Form logo" 
              className="max-h-20 inline-block"
              style={{
                maxWidth: '100%',
                height: 'auto'
              }}
            />
          </div>
        )}

        {/* Display custom header if present */}
        {currentForm.settings.theme.customHeader && (
          <div 
            className="mb-6"
            dangerouslySetInnerHTML={{ __html: currentForm.settings.theme.customHeader }}
          />
        )}

        {/* Show progress bar if enabled */}
        {currentForm.settings.showProgressBar && (
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className={`h-2.5 rounded-full transition-all duration-300 bg-${currentForm.settings.theme.primaryColor}-500`}
                style={{ 
                  width: `${calculateProgress(responses, currentForm.questions)}%`
                }}
              />
            </div>
            <div className="text-right text-sm mt-1 text-gray-600 dark:text-gray-300">
              Progress: {calculateProgress(responses, currentForm.questions)}%
            </div>
          </div>
        )}

        <form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          autoSave={currentForm.settings.disableAutosave ? 'off' : 'on'}
        >
          {(currentForm.settings.shuffleQuestions 
            ? [...currentForm.questions].sort(() => Math.random() - 0.5) 
            : currentForm.questions
          ).map((question) => (
            <div key={question.id} className="space-y-2">
              <label className="block text-sm font-medium">
                {question.question}
                {question.required && <span className="text-red-500 ml-1">*</span>}
                {currentForm.settings.isQuiz && question.points && (
                  <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {question.points} {question.points === 1 ? 'point' : 'points'}
                  </span>
                )}
              </label>
              <FormField
                question={question}
                value={responses[question.id]}
                onChange={(value) => 
                  setResponses(prev => ({
                    ...prev,
                    [question.id]: value
                  }))
                }
              />
            </div>
          ))}

          {currentForm.settings.emailCollection !== 'do_not_collect' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Email Address
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                value={responses['email'] as string || ''}
                onChange={(e) => setResponses(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
              />
            </div>
          )}

          <div className="flex">
            <button
              type="submit"
              className="w-full text-white py-2 px-4 rounded-md transition-colors"
            >
              Submit Form
            </button>
          </div>
        </form>

        {currentForm.settings.theme.customFooter && (
          <div 
            className="mt-6"
            dangerouslySetInnerHTML={{ __html: currentForm.settings.theme.customFooter }}
          />
        )}
      </div>
    </div>
  );
};