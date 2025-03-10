import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { FormQuestion, FormResponse, FormData, EmailCollectionType, FormTheme } from './types/form';
import { parseQuestions } from './utils/questionParser';
import { calculateProgress } from './utils/progressCalculator';
import { FormField } from './components/FormField';
import { QuestionEditor } from './components/QuestionEditor';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { FileText, Send, Plus, PencilLine, Eye, BarChart, ArrowLeft, Trash2, Settings as SettingsIcon, CheckCircle, XCircle } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useLocation, useNavigate } from 'react-router-dom';
import './styles/theme.css';
import { HomePage, EditPage, PreviewPage, AnalyticsPage, SettingsPage } from './pages';


// Default theme settings
const defaultTheme: FormTheme = {
  primaryColor: 'blue',
  style: 'classic',
  darkMode: false,
  customHeader: '',
  customFooter: ''
};

function App() {
  const [input, setInput] = useState('');
  const [forms, setForms] = useState<FormData[]>(() => {
    const saved = localStorage.getItem('forms');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentForm, setCurrentForm] = useState<FormData | null>(null);
  const [responses, setResponses] = useState<Record<string, string | string[] | number | Date>>({});
  const [view, setView] = useState<'list' | 'input' | 'editor' | 'preview' | 'analytics' | 'settings' | 'confirmation'>('list');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [draggedQuestionIndex, setDraggedQuestionIndex] = useState<number | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string>('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Handle URL parameters for shared forms
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const viewParam = urlParams.get('view');
    const formIdParam = urlParams.get('formId');
    const isRespondent = urlParams.get('respondent') === 'true';

    if ((viewParam === 'preview' || isRespondent) && formIdParam) {
      const foundForm = forms.find(form => form.id === formIdParam);
      if (foundForm) {
        setCurrentForm(foundForm);
        setView('preview');
        setResponses({});
      }
    }
  }, [location, forms]);

  useEffect(() => {
    localStorage.setItem('forms', JSON.stringify(forms));
  }, [forms]);

  const handleGenerate = () => {
    const parsedQuestions = parseQuestions(input);

    // Log the parsed questions for debugging
    console.log('Parsed questions:', parsedQuestions);

    if (parsedQuestions.length === 0) {
      alert('No questions were detected. Please check your input format and try again.');
      return;
    }

    const newForm: FormData = {
      id: Math.random().toString(36).substring(2),
      title: 'Untitled Form',
      questions: parsedQuestions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: [],
      settings: {
        isQuiz: false,
        emailCollection: 'do_not_collect' as EmailCollectionType,
        sendResponseCopy: false,
        allowResponseEditing: false,
        limitOneResponse: false,
        showProgressBar: true,
        shuffleQuestions: false,
        confirmationMessage: 'Your response has been recorded.',
        showSubmitAnother: true,
        showResultsSummary: false,
        disableAutosave: false,
        defaultEmailCollection: 'do_not_collect' as EmailCollectionType,
        defaultRequiredQuestions: false,
        theme: { ...defaultTheme }
      }
    };
    setCurrentForm(newForm);
    setForms(prev => [...prev, newForm]);
    setView('editor');
    setResponses({});
  };

  const handleSaveForm = () => {
    if (currentForm) {
      setForms(prev =>
        prev.map(form =>
          form.id === currentForm.id ? currentForm : form
        )
      );
    }
  };

  const handleDeleteForm = (formId: string) => {
    setForms(prev => prev.filter(form => form.id !== formId));
    setShowDeleteConfirm(null);
  };

  const handleQuestionChange = (index: number, updatedQuestion: FormQuestion) => {
    if (!currentForm) return;
    const newQuestions = [...currentForm.questions];
    newQuestions[index] = updatedQuestion;
    setCurrentForm(prev => ({
      ...prev!,
      questions: newQuestions,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleQuestionDelete = (index: number) => {
    if (!currentForm) return;
    setCurrentForm(prev => ({
      ...prev!,
      questions: prev!.questions.filter((_, i) => i !== index),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleAddQuestion = () => {
    if (!currentForm) return;
    setCurrentForm(prev => ({
      ...prev!,
      questions: [
        ...prev!.questions,
        {
          id: Math.random().toString(36).substring(2),
          type: 'short_answer',
          question: 'New Question',
          required: prev!.settings.defaultRequiredQuestions
        },
      ],
      updatedAt: new Date().toISOString(),
    }));
  };

  const checkPreviousSubmission = (email: string) => {
    if (!currentForm) return false;
    return currentForm.responses.some(response =>
      response.answers.email === email
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentForm) return;

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

    // Email sending functionality removed

    // Update form with new response
    setCurrentForm(prev => ({
      ...prev!,
      responses: [...prev!.responses, newResponse]
    }));

    // Store the submitted email for checking future submissions
    setSubmittedEmail(emailToStore);
    setHasSubmitted(true);

    // Clear responses
    setResponses({});

    // Show confirmation page
    setView('confirmation');
  };

  const handleOpenForm = (form: FormData) => {
    setCurrentForm(form);
    setResponses({});
    setView('preview');
  };

  // Handle form routes for shared links
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/form/')) {
      const formId = path.split('/')[2];
      if (formId) {
        const foundForm = forms.find(form => form.id === formId);
        if (foundForm) {
          setCurrentForm(foundForm);
          setView('preview');
          setResponses({});

          // If this is a respondent view, hide the header UI
          const isRespondent = location.search.includes('respondent=true');
          if (isRespondent) {
            // We're in respondent mode - form filling only
            document.body.classList.add('respondent-view');
            setView('preview'); // Ensure we're in preview mode
          } else {
            document.body.classList.remove('respondent-view');
          }
        }
      }
    }
  }, [location.pathname, location.search, forms]);

  const handleStartNewResponse = () => {
    if (currentForm?.settings.limitOneResponse && submittedEmail) {
      if (checkPreviousSubmission(submittedEmail)) {
        alert('You have already submitted a response to this form.');
        return;
      }
    }

    setResponses({});
    setView('preview');
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <Routes>
            <Route path="/" element={<HomePage forms={forms} setForms={setForms} />} />
            <Route path="/edit/:formId" element={<EditPage forms={forms} setForms={setForms} />} />
            <Route path="/preview/:formId" element={<PreviewPage forms={forms} setForms={setForms} />} />
            <Route path="/analytics/:formId" element={<AnalyticsPage forms={forms} />} />
            <Route path="/settings/:formId" element={<SettingsPage forms={forms} setForms={setForms} />} />
            <Route path="/form/:formId" element={<PreviewPage forms={forms} setForms={setForms} />} />
          </Routes>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;