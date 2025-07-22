import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EncodeForm } from '../../components/EncodeForm';
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

describe('EncodeForm', () => {
  const mockFile = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  it('正しくレンダリングされること', () => {
    render(<EncodeForm />);

    expect(screen.getByText('encode.title')).toBeInTheDocument();
    expect(screen.getByText('encode.selectFile')).toBeInTheDocument();
    expect(screen.getByLabelText('encode.watermark')).toBeInTheDocument();
    expect(screen.getByLabelText('encode.strength')).toBeInTheDocument();
    expect(screen.getByLabelText('encode.blockSize')).toBeInTheDocument();
  });

  it('ファイルがアップロードされ、フォームが送信されること', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ fileUrl: 'test-url', fileName: 'test.jpg' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ outputUrl: 'encoded-url' }),
      });

    render(<EncodeForm onSuccess={mockOnSuccess} />);

    // ファイルの選択
    const fileInput = screen.getByLabelText(/encode.selectFile/);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    // フォームの入力
    fireEvent.change(screen.getByLabelText('encode.watermark'), {
      target: { value: 'test watermark' },
    });

    // フォームの送信
    fireEvent.click(screen.getByText('encode.submit'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(mockOnSuccess).toHaveBeenCalledWith('encoded-url');
    });
  });

  it('アップロードエラー時にエラーメッセージが表示されること', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Upload failed' }),
    });

    render(<EncodeForm />);

    const fileInput = screen.getByLabelText(/encode.selectFile/);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    fireEvent.change(screen.getByLabelText('encode.watermark'), {
      target: { value: 'test watermark' },
    });
    fireEvent.click(screen.getByText('encode.submit'));

    await waitFor(() => {
      expect(screen.getByText('encode.errors.uploadFailed')).toBeInTheDocument();
      expect(errorLogger.logError).toHaveBeenCalled();
    });
  });

  it('エンコードエラー時にエラーメッセージが表示されること', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ fileUrl: 'test-url', fileName: 'test.jpg' }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Encode failed' }),
      });

    render(<EncodeForm />);

    const fileInput = screen.getByLabelText(/encode.selectFile/);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    fireEvent.change(screen.getByLabelText('encode.watermark'), {
      target: { value: 'test watermark' },
    });
    fireEvent.click(screen.getByText('encode.submit'));

    await waitFor(() => {
      expect(screen.getByText('encode.errors.encodeFailed')).toBeInTheDocument();
      expect(errorLogger.logError).toHaveBeenCalled();
    });
  });

  it('入力値が正しく更新されること', () => {
    render(<EncodeForm />);

    fireEvent.change(screen.getByLabelText('encode.watermark'), {
      target: { value: 'test watermark' },
    });

    fireEvent.change(screen.getByLabelText('encode.strength'), {
      target: { value: '75' },
    });

    fireEvent.change(screen.getByLabelText('encode.blockSize'), {
      target: { value: '12' },
    });

    fireEvent.change(screen.getByLabelText('encode.quality'), {
      target: { value: '85' },
    });

    expect(screen.getByLabelText('encode.watermark')).toHaveValue('test watermark');
    expect(screen.getByLabelText('encode.strength')).toHaveValue(75);
    expect(screen.getByLabelText('encode.blockSize')).toHaveValue(12);
    expect(screen.getByLabelText('encode.quality')).toHaveValue(85);
  });
});
