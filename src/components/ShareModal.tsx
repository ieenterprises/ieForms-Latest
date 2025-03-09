
import React, { useState } from 'react';
import { X, Link, Code, Copy, Check } from 'lucide-react';

interface ShareModalProps {
  formId: string;
  onClose: () => void;
}

export function ShareModal({ formId, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState<'link' | 'embed' | null>(null);
  
  // Create a direct preview URL that shows only the form for users to fill out
  const previewUrl = `${window.location.origin}/form/${formId}?respondent=true`;
  const embedCode = `<iframe src="${previewUrl}" width="100%" height="600" frameborder="0" allow="clipboard-write"></iframe>`;

  const copyToClipboard = async (text: string, type: 'link' | 'embed') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard. Please try again or copy manually.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Share Form</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share link
            </label>
            <p className="text-sm text-gray-500 mb-2">Anyone with this link can view and fill out this form</p>
            <div className="flex items-center gap-2 border rounded-md overflow-hidden">
              <input
                type="text"
                value={previewUrl}
                readOnly
                className="flex-1 px-3 py-2 focus:outline-none text-gray-700"
              />
              <button
                onClick={() => copyToClipboard(previewUrl, 'link')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors h-full flex items-center gap-2"
              >
                {copied === 'link' ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Embed on your website
            </label>
            <p className="text-sm text-gray-500 mb-2">Add this code to your HTML to embed the form</p>
            <div className="border rounded-md overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 font-mono text-sm text-gray-700 max-h-24 overflow-y-auto">
                {embedCode}
              </div>
              <div className="border-t flex justify-end">
                <button
                  onClick={() => copyToClipboard(embedCode, 'embed')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors flex items-center gap-2"
                >
                  {copied === 'embed' ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy HTML
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-gray-500">
              Anyone who has the link can access and submit responses to your form
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
