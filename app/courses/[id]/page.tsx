"use client";
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Book, Menu, Video } from 'lucide-react';
import { Content, Course } from '@/types/types';
import Sidebar from '@/components/Sidebar';
import VideoPlayer from '@/components/VideoPlayer';
import PDFViewer from '@/components/PDFViewer';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Comments from '@/components/Comments';

async function fetchCourseData(courseId: string) {
  try {
    const response = await fetch(`/api/fullCourse`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: courseId,
      }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch course data");
    }
    
    return response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

const App = () => {
  const [activeContent, setActiveContent] = useState<Content | null>(null);
  const [viewType, setViewType] = useState<'video' | 'pdf'>('video');
  const [sampleCourse, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);


  const courseId = useParams().id;

  useEffect(() => {
    async function loadCourse() {
      if (typeof courseId === 'string') {
        const data = await fetchCourseData(courseId);
        if (data) {
          setCourse(data);
          console.log(data);
        } else {
          setError('Failed to load course');
        }
      } else {
        setError('Invalid course ID');
      }
      setLoading(false);
    }

    loadCourse();
  }, [courseId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!sampleCourse) {
    return <div>No course data available</div>;
  }

  const handleContentSelect = (content: Content) => {
    setActiveContent(content);
    // Automatically set view type based on content type
    if (content.type === 'pdf') {
      setViewType('pdf');
    } else if (content.type === 'video') {
      setViewType('video');
    }
    setIsSidebarOpen(false);

  };
  
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar - hidden by default on mobile */}
        <div className={`
          fixed inset-0 z-50 lg:relative lg:z-0
          ${isSidebarOpen ? 'block' : 'hidden lg:block'}
        `}>
          {/* Overlay for mobile */}
          <div 
            className="absolute inset-0 bg-black/50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
          {/* Sidebar content */}
          <div className="relative w-80 h-full max-w-[80vw] bg-white shadow-xl lg:shadow-none">
            <Sidebar
              content={sampleCourse.content}
              activeContent={activeContent}
              onContentSelect={handleContentSelect}
            />
          </div>
        </div>
  
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-[#5C67E5] text-white px-4 sm:px-6 py-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                className="lg:hidden hover:bg-[#4f5ed7] p-2 rounded-full"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <button className="hidden lg:block hover:bg-[#4f5ed7] p-2 rounded-full">
                <ArrowLeft onClick={() => {router.push('/courses')}} className="w-6 h-6" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-semibold truncate">
                  {sampleCourse.title}
                </h1>
                <p className="text-xs sm:text-sm opacity-80 truncate">
                  {sampleCourse.university} - {sampleCourse.program}
                </p>
              </div>
            </div>
          </header>
          
          {activeContent ? (
            <>
              {(activeContent.videoUrl || activeContent.pdfUrl) && (
                <div className="flex items-center gap-2 px-4 sm:px-6 py-3 border-b border-gray-200 bg-white overflow-x-auto">
                  {activeContent.videoUrl && (
                    <button
                      onClick={() => setViewType('video')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                        viewType === 'video'
                          ? 'bg-[#5C67E5] text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      <span className="hidden sm:inline">Video</span>
                    </button>
                  )}
                  {activeContent.pdfUrl && (
                    <button
                      onClick={() => setViewType('pdf')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                        viewType === 'pdf'
                          ? 'bg-[#5C67E5] text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <Book className="w-4 h-4" />
                      <span className="hidden sm:inline">PDF</span>
                    </button>
                  )}
                </div>
              )}
              <div className="flex-1 overflow-auto p-4 sm:p-6">
                <div className="max-w-5xl mx-auto">
                  <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-semibold mb-4">{activeContent.title}</h2>
                    {activeContent.description && (
                      <p className="text-gray-600 mb-6">{activeContent.description}</p>
                    )}
                    {viewType === 'video' && activeContent.videoUrl ? (
                      <>
                      <VideoPlayer url={activeContent.videoUrl} image={activeContent.thumbnail} />
                      <Comments contentId={activeContent.id} />
                      </>
                    ) : viewType === 'pdf' && activeContent.pdfUrl ? (
                      <PDFViewer url={activeContent.pdfUrl} />
                    ) : (
                      <div className="text-gray-500 text-center py-8">
                        No content available for this type
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 p-4 text-center">
              Select a lesson to start learning
            </div>
          )}
        </div>
      </div>
    );
  }
  
  export default App;