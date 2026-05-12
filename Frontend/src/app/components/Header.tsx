import logoUrl from '../../assets/uchicago-logo.png';

export default function Header() {
  return (
    <header className="h-16 border-b border-[rgba(128,0,0,0.2)] bg-white flex items-center px-6">
      <div className="flex items-center gap-3">
        <img
          src={logoUrl}
          alt="UChicago MSADS"
          className="w-10 h-10 object-contain"
        />
        <div>
          <h1
            className="font-serif m-0 p-0 leading-none"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            ADS Program Assistant
          </h1>
          <div className="text-xs text-[#666] mt-0.5">
            Powered by Qwen3:8b
          </div>
        </div>
      </div>
    </header>
  );
}
