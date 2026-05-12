interface WelcomeScreenProps {
  onQuestionClick: (question: string) => void;
}

export default function WelcomeScreen({ onQuestionClick }: WelcomeScreenProps) {
  const suggestedQuestions = [
    "What courses are required?",
    "How long is the program?",
    "What are the admission requirements?",
    "What career paths are available?"
  ];

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="max-w-2xl w-full px-8 text-center">
        <div className="mb-12 relative">
          <svg
            viewBox="0 0 200 200"
            className="w-48 h-48 mx-auto opacity-5"
            style={{ fill: '#800000' }}
          >
            <path d="M100 40L60 80h25v40h30V80h25l-40-40zm0 100v20h40v-20h-40zm-40 0v20h30v-20h-30z"/>
            <rect x="20" y="20" width="160" height="160" fill="none" stroke="currentColor" strokeWidth="3"/>
          </svg>
        </div>

        <h2
          className="mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Welcome to the ADS Program Assistant
        </h2>

        <p className="text-[#666] mb-8 max-w-lg mx-auto">
          Ask me anything about the University of Chicago Applied Data Science program
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {suggestedQuestions.map((question, idx) => (
            <button
              key={idx}
              onClick={() => onQuestionClick(question)}
              className="px-4 py-2 border-2 border-[#800000] text-[#800000] rounded-full hover:bg-[#f5eeee] transition-colors"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
