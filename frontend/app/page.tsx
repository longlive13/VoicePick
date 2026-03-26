'use client';

import { ChangeEvent, useMemo, useState } from 'react';

type DubbingResponse = {
  success: boolean;
  jobId: number;
  originalFilename: string;
  savedFilename: string;
  targetLanguage: string;
  uploadPath: string;
  audioPath: string;
  transcript: string;
  translatedText: string;
  outputAudioPath: string;
  outputAudioUrl?: string;
  downloadAudioUrl?: string;
};

const BACKEND_URL = 'http://localhost:3000';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('ko');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DubbingResponse | null>(null);
  const [error, setError] = useState('');

  const audioUrl = useMemo(() => {
    if (!result?.outputAudioUrl) return '';
    return `${BACKEND_URL}${result.outputAudioUrl}`;
  }, [result]);

  const downloadUrl = useMemo(() => {
    if (!result?.downloadAudioUrl) return '';
    return `${BACKEND_URL}${result.downloadAudioUrl}`;
  }, [result]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError('');
    setResult(null);

    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    setError('');
    setResult(null);

    if (!selectedFile) {
      setError('파일을 선택해주세요.');
      return;
    }

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('targetLanguage', targetLanguage);

      const response = await fetch(`${BACKEND_URL}/dubbing`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || '더빙 요청에 실패했습니다.');
      }

      setResult(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-cover bg-center" 
    style={{ backgroundImage: "url('/bg-image.png')", backgroundColor: "rgba(0,0,0,0.3)", backgroundBlendMode: "darken",}}>
      <div className="w-full max-w-3xl rounded-[36px] border border-[#e2c79b] bg-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.08)] px-8 py-10">
        <h1 className="text-center text-4xl font-bold text-[#d46b1f]">
          Voice Conversion
        </h1>

        <div className="mt-8 space-y-5">
          <div className="rounded-[24px] border border-[#e2c79b] bg-[#fafafa] px-5 py-5 shadow-sm">
            <label className="block text-sm font-semibold text-[#8b5e34] mb-3">
              파일 업로드
            </label>
            <input
              type="file"
              accept="audio/*,video/*"
              onChange={handleFileChange}
              className="block w-full rounded-xl border border-[#d8c3a3] bg-white px-4 py-3 text-sm"
            />
            <p className="mt-2 text-sm text-gray-500">
              오디오 또는 비디오 파일을 업로드하세요.
            </p>
            {selectedFile && (
              <p className="mt-3 text-sm text-[#5f4a2e]">
                선택된 파일: <span className="font-medium">{selectedFile.name}</span>
              </p>
            )}
          </div>

          <div className="rounded-[24px] border border-[#e2c79b] bg-[#fafafa] px-5 py-5 shadow-sm">
            <label className="block text-sm font-semibold text-[#8b5e34] mb-3">
              Language
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTargetLanguage('en')}
                className={`rounded-full px-5 py-2 text-sm font-medium border ${
                  targetLanguage === 'en'
                    ? 'bg-[#d46b1f] text-white border-[#d46b1f]'
                    : 'bg-white text-[#6a583f] border-[#d8c3a3]'
                }`}
              >
                영어
              </button>
              <button
                type="button"
                onClick={() => setTargetLanguage('ko')}
                className={`rounded-full px-5 py-2 text-sm font-medium border ${
                  targetLanguage === 'ko'
                    ? 'bg-[#d46b1f] text-white border-[#d46b1f]'
                    : 'bg-white text-[#6a583f] border-[#d8c3a3]'
                }`}
              >
                한국어
              </button>
              <button
                type="button"
                onClick={() => setTargetLanguage('ja')}
                className={`rounded-full px-5 py-2 text-sm font-medium border ${
                  targetLanguage === 'ja'
                    ? 'bg-[#d46b1f] text-white border-[#d46b1f]'
                    : 'bg-white text-[#6a583f] border-[#d8c3a3]'
                }`}
              >
                일본어
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full rounded-[24px] bg-[#73a8e5] py-4 text-xl font-semibold text-white shadow-md hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? '더빙 중...' : '더빙 시작'}
          </button>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {result && (
            <section className="mt-6 space-y-4 rounded-[28px] border border-[#e2c79b] bg-[#fffaf2] p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-[#d46b1f]">결과</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-white p-4 border border-[#ead9be]">
                  <p className="text-sm font-semibold text-[#8b5e34] mb-2">전사 결과</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {result.transcript}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4 border border-[#ead9be]">
                  <p className="text-sm font-semibold text-[#8b5e34] mb-2">번역 결과</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {result.translatedText}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4 border border-[#ead9be]">
                <p className="text-sm font-semibold text-[#8b5e34] mb-3">더빙 음성 재생</p>
                {audioUrl ? (
                  <audio controls className="w-full">
                    <source src={audioUrl} type="audio/mpeg" />
                    브라우저가 오디오 재생을 지원하지 않습니다.
                  </audio>
                ) : (
                  <p className="text-sm text-gray-500">재생 가능한 오디오가 없습니다.</p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    className="inline-flex items-center justify-center rounded-2xl border border-[#e2c79b] bg-[#f6df9e] px-6 py-3 font-semibold text-[#b5671d] shadow-sm hover:opacity-95"
                  >
                    다운로드
                  </a>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}