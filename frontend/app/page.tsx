'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';

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
  const { data: session, status } = useSession();
  const [authChecked, setAuthChecked] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isAllowed, setIsAllowed] = useState(false);

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

  useEffect(() => {
  const sendEmailToBackend = async () => {
    if (!session?.user?.email) return;

    try {
      setAuthChecked(false);
      setAuthMessage('');
      setIsAllowed(false);

      const response = await fetch(`${BACKEND_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || '허용되지 않는 사용자입니다.');
      }

      setAccessToken(data.accessToken);
      localStorage.setItem('token', data.accessToken);
      
      setIsAllowed(true);
      setAuthMessage('백엔드 인증 완료');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '허용되지 않는 사용자입니다.';
      
      setIsAllowed(false);
      setAuthMessage(message);
      localStorage.removeItem('token');
      setAccessToken('');
    } finally {
      setAuthChecked(true);
    }
  };

  if(session?.user?.email) {
  sendEmailToBackend();
  } else {
    setAuthChecked(false);
    setAuthMessage('');
    setIsAllowed(false);
    setAccessToken('');
    localStorage.removeItem('token');
  }
}, [session]);

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

      const token = localStorage.getItem('token');
      if (!token) {
        setError('로그인이 만료되었습니다. 다시 로그인해주세요.');
        return;
      }
      const response = await fetch(`${BACKEND_URL}/dubbing`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
  if (status === 'loading') {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-10 bg-cover bg-center"
      style={{
        backgroundImage: "url('/bg-image1.png')",
        backgroundColor: 'rgba(0,0,0,0.3)',
        backgroundBlendMode: 'darken',
      }}
    >
      <div className="rounded-[24px] bg-white/90 px-8 py-6 text-lg font-semibold text-[#8b5e34] shadow-lg">
        로그인 상태를 확인하는 중...
      </div>
    </main>
  );
}
if (!session) {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-10 bg-cover bg-center"
      style={{
        backgroundImage: "url('/bg-image1.png')",
        backgroundColor: 'rgba(255,255,255,0.08)',
        backgroundBlendMode: 'lighten',
      }}
    >
      <div className="w-full max-w-md rounded-[36px] border border-[#e2c79b] bg-white/90 px-8 py-10 text-center shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        <h1 className="text-4xl font-bold text-[#d46b1f]">Voice Conversion</h1>
        <p className="mt-4 text-sm text-[#6a583f]">
          서비스를 이용하려면 Google 계정으로 로그인해주세요.
        </p>

        <button
          type="button"
          onClick={() => signIn('google')}
          className="mt-8 w-full rounded-[24px] bg-[#73a8e5] py-4 text-xl font-semibold text-white shadow-md hover:opacity-95"
        >
          Google 로그인
        </button>
      </div>
    </main>
  );
}
if (session && authChecked && !isAllowed) {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-10 bg-cover bg-center"
      style={{
        backgroundImage: "url('/bg-image.png')",
        backgroundColor: 'rgba(0,0,0,0.3)',
        backgroundBlendMode: 'darken',
      }}
    >
      <div className="w-full max-w-md rounded-[36px] border border-red-200 bg-white/90 px-8 py-10 text-center shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        <h1 className="text-3xl font-bold text-red-600">접근 제한</h1>

        <p className="mt-4 text-base text-[#6a583f]">
          접근이 제한된 사용자입니다.
        </p>

        <p className="mt-2 text-sm text-gray-500">
          허용 리스트에 등록된 계정만 서비스를 이용할 수 있습니다.
        </p>

        <div className="mt-6 rounded-2xl bg-[#fafafa] px-4 py-3 text-sm text-[#5f4a2e] border border-[#ead9be]">
          {session.user?.email}
        </div>

        {authMessage && (
          <p className="mt-4 text-sm text-red-500">{authMessage}</p>
        )}

        <button
          type="button"
          onClick={() => signOut()}
          className="mt-8 w-full rounded-[24px] border border-[#d8c3a3] bg-white py-4 text-lg font-semibold text-[#6a583f] hover:bg-[#f8f1e7]"
        >
          로그아웃
        </button>
      </div>
    </main>
  );
}
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-cover bg-center" 
    style={{ backgroundImage: "url('/bg-image1.png')", backgroundColor: "rgba(0,0,0,0.3)", backgroundBlendMode: "darken",}}>
      <div className="w-full max-w-3xl rounded-[36px] border border-[#e2c79b] bg-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.08)] px-8 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[#8b5e34]">로그인됨</p>
            <p className="text-sm font-semibold text-[#5f4a2e]">
              {session.user?.email}
            </p>
          </div>

          <button
            type="button"
            onClick={() => signOut()}
            className="rounded-full border border-[#d8c3a3] bg-white px-4 py-2 text-sm font-medium text-[#6a583f] hover:bg-[#f8f1e7]"
          >
            로그아웃
          </button>
        </div>
        
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