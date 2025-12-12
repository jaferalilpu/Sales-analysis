'use client';

import { useState } from 'react';
import EmailMarketingDashboard from '@/components/admin/EmailMarketingDashboard';
import { EmailTemplateEditor } from '@/components/admin/EmailTemplateEditor';
import { EmailCampaignCreator } from '@/components/admin/EmailCampaignCreator';
import { EmailTemplate, EmailCampaign } from '@/types/email-marketing';

export default function EmailMarketingPage() {
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [showCampaignCreator, setShowCampaignCreator] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowTemplateEditor(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setShowTemplateEditor(true);
  };

  const handleCreateCampaign = () => {
    setShowCampaignCreator(true);
  };

  const handleTemplateSave = (template: EmailTemplate) => {
    
    setShowTemplateEditor(false);
    setEditingTemplate(null);
    // Refresh the dashboard
    window.location.reload();
  };

  const handleCampaignSave = (campaign: EmailCampaign) => {
    
    setShowCampaignCreator(false);
    // Refresh the dashboard
    window.location.reload();
  };

  return (
    <>
      <EmailMarketingDashboard 
        onCreateTemplate={handleCreateTemplate}
        onEditTemplate={handleEditTemplate}
        onCreateCampaign={handleCreateCampaign}
      />
      
      {showTemplateEditor && (
        <EmailTemplateEditor
          template={editingTemplate || undefined}
          onSave={handleTemplateSave}
          onCancel={() => {
            setShowTemplateEditor(false);
            setEditingTemplate(null);
          }}
        />
      )}
      
      {showCampaignCreator && (
        <EmailCampaignCreator
          onSave={handleCampaignSave}
          onCancel={() => setShowCampaignCreator(false)}
        />
      )}
    </>
  );
}
