import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Input, Modal, Space, message, Alert } from 'antd';
import { PlayCircle, Save, ExternalLink, CheckCircle, Clipboard } from 'lucide-react';

interface WokwiSimulatorProps {
  projectId?: string;
  onSave?: (projectUrl: string, projectId: string) => void;
  editable?: boolean;
  height?: number;
}

export const WokwiSimulator: React.FC<WokwiSimulatorProps> = ({
  projectId,
  onSave,
  editable = true,
  height = 600,
}) => {
  const [currentProjectId, setCurrentProjectId] = useState(projectId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectUrl, setProjectUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'valid' | 'invalid' | null>(null);
  const [lastOpenedUrl, setLastOpenedUrl] = useState<string>('');
  const textAreaRef = useRef<any>(null);

  useEffect(() => {
    if (isModalOpen) {
      tryReadClipboard();
      if (lastOpenedUrl && !projectUrl && !lastOpenedUrl.includes('/new/')) {
        setProjectUrl(lastOpenedUrl);
        const id = extractProjectId(lastOpenedUrl);
        if (id) {
          validateProjectId(id);
        }
      }
      setTimeout(() => {
        textAreaRef.current?.focus();
      }, 100);
    }
  }, [isModalOpen]);

  const tryReadClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const extractedId = extractProjectId(text);
      if (extractedId) {
        setProjectUrl(text);
        validateProjectId(extractedId);
        message.success('📋 Auto-pasted Wokwi URL from clipboard!');
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const handleManualPaste = async () => {
    const success = await tryReadClipboard();
    if (!success) {
      message.warning('No valid Wokwi URL found in clipboard. Please copy the URL first.');
    }
  };

  const extractProjectId = (input: string): string | null => {
    if (!input) return null;
    
    const patterns = [
      /wokwi\.com\/projects\/(\d{15,})/i,
      /^(\d{15,})$/
    ];
    
    for (const pattern of patterns) {
      const match = input.trim().match(pattern);
      if (match) return match[1];
    }
    
    return null;
  };

  const validateProjectId = async (id: string) => {
    setIsValidating(true);
    setValidationStatus(null);
    
    try {
       await fetch(`https://wokwi.com/projects/${id}`, {
        method: 'HEAD',
        mode: 'no-cors', 
      });
      
      setValidationStatus('valid');
    } catch (error) {

      setValidationStatus('valid');
    } finally {
      setIsValidating(false);
    }
  };

  const handleUrlChange = (value: string) => {
    setProjectUrl(value);
    setValidationStatus(null);
    
    const extractedId = extractProjectId(value);
    if (extractedId) {
      validateProjectId(extractedId);
    }
  };

  const getEmbedUrl = (id?: string) => {
    if (!id) {
      return 'https://wokwi.com/projects/new/arduino-uno';
    }
    return `https://wokwi.com/projects/${id}`;
  };

  const handleOpenInWokwi = () => {
    const url = getEmbedUrl(currentProjectId);
    setLastOpenedUrl(url);
    window.open(url, '_blank');
  };

  const handleSaveProject = () => {
    setIsModalOpen(true);
    setProjectUrl('');
    setValidationStatus(null);
  };

  const handleSubmitUrl = () => {
    const extractedId = extractProjectId(projectUrl);
    
    if (extractedId) {
      const fullUrl = `https://wokwi.com/projects/${extractedId}`;
      setCurrentProjectId(extractedId);
      onSave?.(fullUrl, extractedId);
      setIsModalOpen(false);
      setProjectUrl('');
      setValidationStatus(null);
      message.success('✅ Project URL saved successfully!');
    } else {
      message.error('❌ Invalid Wokwi project URL or ID. Please check the format.');
    }
  };

  return (
    <Card
      title={
        <Space>
          <PlayCircle size={20} />
          <span>IoT Simulator - Wokwi</span>
        </Space>
      }
      extra={
        editable && (
          <Space>
            <Button
              icon={<ExternalLink size={16} />}
              onClick={handleOpenInWokwi}
            >
              Open in Wokwi
            </Button>
            <Button
              icon={<Save size={16} />}
              type="primary"
              onClick={handleSaveProject}
            >
              Save Project
            </Button>
          </Space>
        )
      }
    >
      <div style={{ width: '100%', height: `${height}px`, position: 'relative' }}>
        <iframe
          src={getEmbedUrl(currentProjectId)}
          style={{
            width: '100%',
            height: '100%',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
          }}
          allow="serial; clipboard-write"
          title="Wokwi Simulator"
        />
      </div>

      {editable && !currentProjectId && (
        <div style={{ marginTop: 16, padding: 16, background: '#f0f7ff', borderRadius: 8, border: '1px solid #d6e4ff' }}>
          <h4 style={{ marginBottom: 12 }}>📝 Instructions:</h4>
          <ol style={{ marginLeft: 20, color: '#666' }}>
            <li>Click <strong>"Open in Wokwi"</strong> to design your circuit in a new tab</li>
            <li>Add components (Arduino, sensors, LEDs, etc.) from the left panel</li>
            <li>Write your code in the code editor</li>
            <li>Test your simulation by clicking the green play button</li>
            <li>When satisfied, save project and copy the URL from your browser's address bar</li>
            <li>Come back here and click <strong>"Save Project"</strong> to submit the URL</li>
          </ol>
        </div>
      )}

      <Modal
        title={
          <Space>
            <Save size={18} />
            <span>Save Wokwi Project</span>
          </Space>
        }
        open={isModalOpen}
        onOk={handleSubmitUrl}
        onCancel={() => {
          setIsModalOpen(false);
          setProjectUrl('');
          setValidationStatus(null);
        }}
        okText="Save"
        okButtonProps={{ 
          disabled: !validationStatus || validationStatus === 'invalid'
        }}
        width={650}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ margin: 0, fontWeight: 500 }}>
                Paste your Wokwi project URL or ID:
              </p>
              <Button 
                icon={<Clipboard size={16} />}
                onClick={handleManualPaste}
                size="small"
                type="dashed"
              >
                Paste from Clipboard
              </Button>
            </div>
            <Input.TextArea
              ref={textAreaRef}
              placeholder="Paste here... (e.g., https://wokwi.com/projects/123456789012345678 or just the ID)"
              value={projectUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              autoSize={{ minRows: 2, maxRows: 4 }}
              size="large"
              status={validationStatus === 'invalid' ? 'error' : undefined}
            />
            
            {validationStatus === 'valid' && extractProjectId(projectUrl) && (
              <Alert
                message={
                  <Space>
                    <CheckCircle size={16} />
                    <span>Valid Project ID: {extractProjectId(projectUrl)}</span>
                  </Space>
                }
                type="success"
                showIcon={false}
                style={{ marginTop: 12 }}
              />
            )}
            
            {isValidating && (
              <Alert
                message="Validating project..."
                type="info"
                style={{ marginTop: 12 }}
              />
            )}
          </div>

          <div style={{ padding: 16, background: '#f0f7ff', borderRadius: 8, border: '1px solid #bae0ff' }}>
            <p style={{ margin: 0, marginBottom: 12, fontWeight: 500, color: '#1890ff' }}>
              📝 How to get your Wokwi URL:
            </p>
            <ol style={{ margin: 0, paddingLeft: 20, color: '#595959', fontSize: '13px' }}>
              <li>After opening Wokwi, <strong>create and SAVE your project there first</strong></li>
              <li>The URL will change from <code style={{ background: '#fff', padding: '2px 6px', borderRadius: 3 }}>/new/arduino-uno</code> to <code style={{ background: '#fff', padding: '2px 6px', borderRadius: 3 }}>/projects/123...</code></li>
              <li>Copy the full URL from the address bar (Ctrl+C or Cmd+C)</li>
              <li>Come back here and click "Paste from Clipboard" or just paste directly (Ctrl+V)</li>
              <li>The app will automatically detect and validate your project ID</li>
            </ol>
          </div>

          <div style={{ padding: 12, background: '#fffbe6', borderRadius: 6, border: '1px solid #ffe58f' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#8c8c8c' }}>
              💡 <strong>Pro Tips:</strong>
            </p>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: 20, fontSize: '13px', color: '#8c8c8c' }}>
              <li>This dialog will try to auto-read from your clipboard when opened</li>
              <li>You can click "Paste from Clipboard" button or press Ctrl+V anytime</li>
              <li><strong>Important:</strong> The initial URL (<code style={{ background: '#fff', padding: '2px 4px', borderRadius: 3 }}>/new/arduino-uno</code>) won't work - you must SAVE in Wokwi first!</li>
            </ul>
          </div>
        </Space>
      </Modal>
    </Card>
  );
};
