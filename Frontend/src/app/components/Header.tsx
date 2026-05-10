export default function Header() {
  return (
    <header className="h-16 border-b border-[rgba(128,0,0,0.2)] bg-white flex items-center px-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#800000] rounded-sm flex items-center justify-center">
          <svg
            viewBox="0 0 40 40"
            className="w-7 h-7 fill-white"
          >
            <path d="M20 8L12 16h5v8h6v-8h5l-8-8zm0 20v4h8v-4h-8zm-8 0v4h6v-4h-6z" />
          </svg>
        </div>
        <div>
          <h1
            className="font-serif m-0 p-0 leading-none"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            ADS Program Assistant
          </h1>
          <div className="text-xs text-[#666] mt-0.5">
            Powered by RAG
          </div>
        </div>
      </div>
    </header>
  );
}