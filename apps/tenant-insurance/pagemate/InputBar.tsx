import styled from '@emotion/styled';
import React, { useCallback, useState } from 'react';

import { SparkleIcon } from '../components/icons/SparkleIcon';

interface InputBarProps {
  onSendMessage: (message: string) => void;
  loading?: boolean;
  placeholder?: string;
}

export const InputBar: React.FC<InputBarProps> = ({
  onSendMessage,
  loading = false,
  placeholder = 'Ask me anything about this website…',
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (input.trim() && !loading) {
        onSendMessage(input.trim());
        setInput('');
      }
    },
    [input, loading, onSendMessage],
  );

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <InputContainer>
        <InputIcon>
          <SparkleIcon />
        </InputIcon>
        <InputContent>
          <InputField
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!loading && input.trim()) {
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }
            }}
            disabled={loading}
          />
          <InputLabel>{loading ? 'Generating…' : 'Turbo Mode'}</InputLabel>
        </InputContent>
        <SendButton type="submit" disabled={!input.trim() || loading}>
          {loading ? '…' : 'Send'}
        </SendButton>
      </InputContainer>
    </form>
  );
};

const InputContainer = styled.div`
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;

  display: flex;
  align-items: center;
  gap: 8px;

  padding: 12px;
  background: linear-gradient(
    180deg,
    rgba(234, 248, 255, 0.88) 0%,
    rgba(238, 250, 255, 0.88) 100%
  );
  border-radius: 8px;
  box-shadow: 0px 4px 9.9px 0px #bae3f8;
`;

const InputIcon = styled.div`
  width: 24px;
  height: 24px;
  flex-shrink: 0;
`;

const InputContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const InputField = styled.input`
  font-size: 16px;
  font-weight: 400;
  letter-spacing: -0.64px;
  color: #000000;
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  ::placeholder {
    color: #6c8bab;
  }
`;

const InputLabel = styled.span`
  font-size: 12px;
  font-weight: 400;
  letter-spacing: -0.48px;
  color: #0093f6;
`;

const SendButton = styled.button`
  flex-shrink: 0;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid rgba(0, 147, 246, 0.16);
  background: rgba(171, 220, 246, 0.31);
  color: #0093f6;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  &:not(:disabled):hover {
    background: rgba(171, 220, 246, 0.45);
  }
`;
