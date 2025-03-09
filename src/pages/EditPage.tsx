
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormQuestion, FormData } from '../types/form';
import { QuestionEditor } from '../components/QuestionEditor';
import { Plus, ArrowLeft } from 'lucide-react';

interface EditPageProps {
  forms: FormData[];
  setForms: React.Dispatch<React.SetStateAction<FormData[]>>;
}

export const EditPage: React.FC<EditPageProps> = ({ forms, setForms }) => {
  const [draggedQuestionIndex, setDraggedQuestionIndex] = React.useState<number | null>(null);
  const { formId } = useParams();
  const navigate = useNavigate();
  
  const currentForm = forms.find(form => form.id === formId);
  
  if (!currentForm) {
    return <div className="p-6">Form not found</div>;
  }

  const handleQuestionChange = (index: number, updatedQuestion: FormQuestion) => {
    const newQuestions = [...currentForm.questions];
    newQuestions[index] = updatedQuestion;
    
    const updatedForm = {
      ...currentForm,
      questions: newQuestions,
      updatedAt: new Date().toISOString(),
    };
    
    setForms(prev => prev.map(form => form.id === formId ? updatedForm : form));
  };

  const handleQuestionDelete = (index: number) => {
    const newQuestions = currentForm.questions.filter((_, i) => i !== index);
    
    const updatedForm = {
      ...currentForm,
      questions: newQuestions,
      updatedAt: new Date().toISOString(),
    };
    
    setForms(prev => prev.map(form => form.id === formId ? updatedForm : form));
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: Math.random().toString(36).substring(2),
      type: 'short_answer',
      question: 'New Question',
      required: currentForm.settings.defaultRequiredQuestions
    };
    
    const updatedForm = {
      ...currentForm,
      questions: [...currentForm.questions, newQuestion],
      updatedAt: new Date().toISOString(),
    };
    
    setForms(prev => prev.map(form => form.id === formId ? updatedForm : form));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedForm = {
      ...currentForm,
      title: e.target.value,
      updatedAt: new Date().toISOString(),
    };
    
    setForms(prev => prev.map(form => form.id === formId ? updatedForm : form));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold ml-2">Edit Form</h1>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          value={currentForm.title}
          onChange={handleTitleChange}
          className="w-full px-4 py-2 text-2xl font-bold border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:ring-0 bg-transparent"
          placeholder="Form Title"
        />

        <div className="space-y-4">
          {currentForm.questions.map((question, index) => (
            <QuestionEditor
              key={question.id}
              question={question}
              onChange={(updatedQuestion) => handleQuestionChange(index, updatedQuestion)}
              onDelete={() => handleQuestionDelete(index)}
              index={index}
              isQuiz={currentForm.settings.isQuiz}
              defaultRequired={currentForm.settings.defaultRequiredQuestions}
              onDragStart={(e) => setDraggedQuestionIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedQuestionIndex === null) return;
                const questions = [...currentForm.questions];
                const [removed] = questions.splice(draggedQuestionIndex, 1);
                questions.splice(index, 0, removed);
                
                const updatedForm = {
                  ...currentForm,
                  questions,
                  updatedAt: new Date().toISOString(),
                };
                
                setForms(prev => prev.map(form => form.id === formId ? updatedForm : form));
                setDraggedQuestionIndex(null);
              }}
            />
          ))}
        </div>

        <button
          onClick={handleAddQuestion}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Question
        </button>
      </div>
    </div>
  );
};
