import React, { useState } from 'react';
import { Copy, Check, Calendar, Link } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { File } from '../types';
import { copyToClipboard } from '../utils/format';
import toast from 'react-hot-toast';

interface ShareModalProps {
  file: File | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateShareLink: (args: { fileId: string; expiresAt: string }) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  file,
  isOpen,
  onClose,
  onCreateShareLink
}) => {
  const [expiryDays, setExpiryDays] = useState('7');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  if (!file) return null;

  const handleCreateLink = () => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays));

    onCreateShareLink({ fileId: file.id, expiresAt: expiresAt.toISOString() });

    // Simulate share URL creation
    const url = `${window.location.origin}/shared/${file.id}`;
    setShareUrl(url);
  };

  const handleCopyLink = async () => {
    if (shareUrl) {
      const success = await copyToClipboard(shareUrl);
      if (success) {
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share File" maxWidth="md">
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
            <Link className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{file.name}</p>
            <p className="text-sm text-gray-600">Create a shareable link</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Link expires in:
          </label>
          <select
            value={expiryDays}
            onChange={(e) => setExpiryDays(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1">1 day</option>
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
          </select>
        </div>

        {!shareUrl ? (
          <Button
            variant="primary"
            onClick={handleCreateLink}
            className="w-full"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Create Share Link
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button
                variant="secondary"
                onClick={handleCopyLink}
                className="flex-shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              This link will expire in {expiryDays} day{expiryDays !== '1' ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};