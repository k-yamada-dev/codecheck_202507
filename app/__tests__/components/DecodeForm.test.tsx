import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DecodeForm } from '../../components/DecodeForm';
import { errorLogger } from '../../utils/errorLogging';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../utils/errorLogging', () => ({
  errorLogger: {
    logError: jest.fn(),
  },
}));

describe('DecodeForm', () => {
  const mockFile = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  it('正しくレンダリングされること', () => {
    render(<DecodeForm onSuccess={mockOnSuccess} />);

    expect(screen.getByText('decode.title')).toBeInTheDocument();
    expect(screen.getByText('decode.selectFile')).toBeInTheDocument();
    expect(screen.getByLabelText('decode.blockSize')).toBeInTheDocument();
    expect(screen.getByLabelText('decode.timer')).toBeInTheDocument();
  });

  it('ファイルがアップロードされ、フォームが送信されること', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ fileName: 'test.jpg' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ result: 'Decoded content' }),
      });

    render(<DecodeForm onSuccess={mockOnSuccess} />);

    const fileInput = screen.getByLabelText(/decode.selectFile/);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    fireEvent.click(screen.getByText('decode.submit'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(mockOnSuccess).toHaveBeenCalledWith('Decoded content');
    });
  });

  it('アップロードエラー時にエラーメッセージが表示されること', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Upload failed' }),
    });

    render(<DecodeForm />);

    const fileInput = screen.getByLabelText(/decode.selectFile/);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    fireEvent.click(screen.getByText('decode.submit'));

    await waitFor(() => {
      expect(screen.getByText('decode.errors.uploadFailed')).toBeInTheDocument();
      expect(errorLogger.logError).toHaveBeenCalled();
    });
  });
});
