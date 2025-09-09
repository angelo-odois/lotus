import Image from 'next/image';

export function Header() {
  return (
    <div className="relative bg-gradient-to-br from-[#FFC629] to-[#FFD93D] p-12 md:p-16 text-center overflow-hidden rounded-t-2xl">
      {/* Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat'
        }}
      />
      
      {/* Logo container */}
      <div className="relative z-10">
        <div className="bg-[#1A1A1A] inline-block p-6 rounded-2xl mb-6 shadow-xl">
          <Image 
            src="/logo.svg" 
            alt="Lotus" 
            width={120} 
            height={40} 
            className="filter invert brightness-0 contrast-100" 
          />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-3 tracking-wide">
          PROPOSTA DE COMPRA
        </h1>
        
        <p className="text-[#1A1A1A] text-lg md:text-xl font-medium opacity-80">
          Complete suas informações para gerar sua proposta personalizada
        </p>
      </div>
    </div>
  );
}