
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormData } from '../types/form';
import { parseQuestions } from '../utils/questionParser';
import { FileText, Plus, Trash2 } from 'lucide-react';

interface HomePageProps {
  forms: FormData[];
  setForms: React.Dispatch<React.SetStateAction<FormData[]>>;
}

export const HomePage: React.FC<HomePageProps> = ({ forms, setForms }) => {
  const [input, setInput] = useState('');
  const [view, setView] = useState<'list' | 'input'>('list');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGenerate = () => {
    const parsedQuestions = parseQuestions(input);

    // Log the parsed questions for debugging
    console.log('Parsed questions:', parsedQuestions);

    if (parsedQuestions.length === 0) {
      alert('No questions were detected. Please check your input format and try again.');
      return;
    }

    // Default theme settings
    const defaultTheme = {
      primaryColor: 'blue',
      style: 'classic',
      darkMode: false,
      customHeader: '',
      customFooter: ''
    };

    const newForm: FormData = {
      id: Math.random().toString(36).substring(2),
      title: 'Untitled Form',
      questions: parsedQuestions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: [],
      settings: {
        isQuiz: false,
        emailCollection: 'do_not_collect',
        sendResponseCopy: false,
        allowResponseEditing: false,
        limitOneResponse: false,
        showProgressBar: true,
        shuffleQuestions: false,
        confirmationMessage: 'Your response has been recorded.',
        showSubmitAnother: true,
        showResultsSummary: false,
        disableAutosave: false,
        defaultEmailCollection: 'do_not_collect',
        defaultRequiredQuestions: false,
        theme: { ...defaultTheme }
      }
    };
    
    setForms(prev => [...prev, newForm]);
    navigate(`/edit/${newForm.id}`);
  };

  const handleDeleteForm = (formId: string) => {
    setForms(prev => prev.filter(form => form.id !== formId));
    setShowDeleteConfirm(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <FileText className="w-8 h-8 text-blue-500 mr-2" />
          <h1 className="text-3xl font-bold text-gray-900">Form Builder</h1>
        </div>
      </div>

      {view === 'list' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <button
              onClick={() => setView('input')}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New Form
            </button>
          </div>

          {forms.map(form => (
            <div
              key={form.id}
              className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between"
            >
              <div>
                <h2 className="text-xl font-semibold">{form.title}</h2>
                <p className="text-gray-500">
                  {form.responses.length} responses · Created{' '}
                  {new Date(form.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/edit/${form.id}`)}
                  className="px-4 py-2 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => navigate(`/preview/${form.id}`)}
                  className="px-4 py-2 text-green-500 hover:bg-green-50 rounded-md transition-colors"
                >
                  Preview
                </button>
                <button
                  onClick={() => navigate(`/analytics/${form.id}`)}
                  className="px-4 py-2 text-purple-500 hover:bg-purple-50 rounded-md transition-colors"
                >
                  Analytics
                </button>
                <button
                  onClick={() => navigate(`/settings/${form.id}`)}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Settings
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(form.id)}
                  className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'input' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Paste your questions below (one per line):
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px] mb-4"
            placeholder="Example of multiple-choice questions:
What is your Name? John, Mike, Queen
What is your Gender? Male, Female, Other
What is your Age Range? 15-19 years, 20-24 years, 25-29 years"
          />
          <div className="text-sm text-gray-600 mb-4">
            <p><strong>Tip:</strong> For multiple-choice questions, type your question followed by a question mark, then list the options separated by commas.</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setView('list')}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              Generate Form
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Delete Form</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this form? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteForm(showDeleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
