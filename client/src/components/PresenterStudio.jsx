import React, { useState } from 'react';
import Header from './Header';
import SlideNavigator from './SlideNavigator';
import SlidePreview from './SlidePreview';
import SlideInteractions from './SlideInteractions';
import AudienceResponses from './AudienceResponses';
import PresentationOptions from './PresentationOptions';
import RightFeaturesMenu from './RightFeaturesMenu';
import LiveSubtitlesControl from './LiveSubtitlesControl';
import AudienceMobile from './AudienceMobile';
import ReportsModal from './ReportsModal';

export default function PresenterStudio({
  presentation,
  audienceCount,
  onSelectSlide,
  onPrevSlide,
  onNextSlide,
  onAddSlide,
  onToggleOption,
  onToggleInteraction,
  onPinQuestion,
  onAnswerQuestion,
  onDeleteQuestion,
  onUpvoteQuestion,
  onOpenPresentation,
  isListening,
  onToggleListening,
  onSendTranscript,
  onVote,
  onAnswerQuiz,
  onSubmitQuestion,
  onSendReaction,
  user,
  onOpenDashboard,
  onOpenAuthModal,
}) {
  const [showMobilePreview, setShowMobilePreview] = useState(true);
  const [activeFeature, setActiveFeature] = useState('qa');
  const [showReportsModal, setShowReportsModal] = useState(false);

  const currentSlide = presentation.slides[presentation.currentSlideIndex] || presentation.slides[0];
  const activePoll = currentSlide?.pollId ? presentation.polls[currentSlide.pollId] : null;
  const activeQuiz = currentSlide?.quizId ? presentation.quizzes[currentSlide.quizId] : null;

  return (
    <div className="min-h-screen bg-[#fcfaff] text-slate-800 flex flex-col selection:bg-purple-200">
      {/* Top Claper Header */}
      <Header
        presentation={presentation}
        audienceCount={audienceCount}
        onOpenPresentation={onOpenPresentation}
        onToggleMobilePreview={() => setShowMobilePreview(!showMobilePreview)}
        showMobilePreview={showMobilePreview}
        user={user}
        onOpenDashboard={onOpenDashboard}
        onOpenAuthModal={onOpenAuthModal}
      />

      {/* Main Studio Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* 1. Left: Slide Deck Thumbnail Navigator */}
        <SlideNavigator
          slides={presentation.slides}
          currentSlideIndex={presentation.currentSlideIndex}
          onSelectSlide={onSelectSlide}
          onAddSlide={onAddSlide}
        />

        {/* 2. Center Studio Canvas & Interaction Panels */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-4">
          {/* Top Row: Slide Preview + Options */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <SlidePreview
                slide={currentSlide}
                currentIndex={presentation.currentSlideIndex}
                totalSlides={presentation.slides.length}
                onPrevSlide={onPrevSlide}
                onNextSlide={onNextSlide}
                poll={activePoll}
                quiz={activeQuiz}
                subtitles={presentation.subtitles}
                showResultsOnPresentation={presentation.options.showResultsOnPresentation}
                onOpenFullscreen={onOpenPresentation}
              />
            </div>

            {/* Presentation Options switches */}
            <div className="space-y-4">
              <PresentationOptions
                options={presentation.options}
                onToggleOption={onToggleOption}
              />

              {/* Real-time Subtitles / Audio Stream Control */}
              <LiveSubtitlesControl
                isListening={isListening}
                onToggleListening={onToggleListening}
                currentTranscript={presentation.subtitles}
                onSendTranscript={onSendTranscript}
              />
            </div>
          </div>

          {/* Bottom Row: Slide Interactions + Audience Responses Feed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SlideInteractions
              currentSlide={currentSlide}
              polls={presentation.polls}
              quizzes={presentation.quizzes}
              onToggleInteraction={onToggleInteraction}
            />

            <AudienceResponses
              questions={presentation.questions}
              messages={presentation.messages}
              onPinQuestion={onPinQuestion}
              onAnswerQuestion={onAnswerQuestion}
              onDeleteQuestion={onDeleteQuestion}
              onUpvoteQuestion={onUpvoteQuestion}
            />
          </div>
        </main>

        {/* 3. Mobile Device Live Simulator (as shown in reference image) */}
        {showMobilePreview && (
          <aside className="shrink-0 p-4 border-l border-purple-100 bg-purple-50/30 flex items-center justify-center">
            <div className="sticky top-4">
              <div className="text-center mb-2">
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider bg-purple-100 px-2.5 py-1 rounded-full">
                  Live Participant Screen
                </span>
              </div>
              <AudienceMobile
                presentation={presentation}
                currentSlide={currentSlide}
                poll={activePoll}
                quiz={activeQuiz}
                questions={presentation.questions}
                messages={presentation.messages}
                subtitles={presentation.subtitles}
                audienceCount={audienceCount}
                onVote={onVote}
                onAnswerQuiz={onAnswerQuiz}
                onSubmitQuestion={onSubmitQuestion}
                onUpvoteQuestion={onUpvoteQuestion}
                onSendReaction={onSendReaction}
              />
            </div>
          </aside>
        )}

        {/* 4. Far Right Menu Features (Q&A, Quizzes, Polls, Transcription...) */}
        <aside className="p-4 border-l border-purple-100 bg-white hidden 2xl:flex flex-col">
          <RightFeaturesMenu
            activeFeature={activeFeature}
            onSelectFeature={(feat) => {
              setActiveFeature(feat);
              if (feat === 'reports') {
                setShowReportsModal(true);
              }
            }}
            isListening={isListening}
            onToggleTranscription={onToggleListening}
          />
        </aside>
      </div>

      {/* Reports & Analytics Export Modal */}
      <ReportsModal
        isOpen={showReportsModal}
        onClose={() => setShowReportsModal(false)}
        presentation={presentation}
        audienceCount={audienceCount}
      />
    </div>
  );
}
