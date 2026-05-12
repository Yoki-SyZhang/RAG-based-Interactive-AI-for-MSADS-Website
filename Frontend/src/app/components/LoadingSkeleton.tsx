export default function LoadingSkeleton() {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[80%] bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-[rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2 text-[#800000]">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-[#800000] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-[#800000] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-[#800000] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-sm">Searching knowledge base...</span>
        </div>
      </div>
    </div>
  );
}
