import React from 'react';

interface LogoItem {
  name: string;
  src: string;
  gradient: string; // Tailwind gradient classes
}

const logosList: LogoItem[] = [
  {
    name: 'Procure',
    src: 'https://www.google.com/s2/favicons?domain=procure.com&sz=128',
    gradient: 'from-blue-500/20 to-indigo-500/20',
  },
  {
    name: 'Shopify',
    src: 'https://www.google.com/s2/favicons?domain=shopify.com&sz=128',
    gradient: 'from-yellow-400/20 to-amber-500/20',
  },
  {
    name: 'Blender',
    src: 'https://www.google.com/s2/favicons?domain=blender.org&sz=128',
    gradient: 'from-blue-400/20 to-cyan-500/20',
  },
  {
    name: 'Figma',
    src: 'https://www.google.com/s2/favicons?domain=figma.com&sz=128',
    gradient: 'from-purple-500/20 to-indigo-500/20',
  },
  {
    name: 'Spotify',
    src: 'https://www.google.com/s2/favicons?domain=spotify.com&sz=128',
    gradient: 'from-rose-500/20 to-pink-600/20',
  },
  {
    name: 'Lottielab',
    src: 'https://www.google.com/s2/favicons?domain=lottielab.com&sz=128',
    gradient: 'from-yellow-300/20 to-emerald-400/20',
  },
  {
    name: 'Google Cloud',
    src: 'https://www.google.com/s2/favicons?domain=cloud.google.com&sz=128',
    gradient: 'from-sky-400/20 to-blue-500/20',
  },
  {
    name: 'Bing',
    src: 'https://www.google.com/s2/favicons?domain=bing.com&sz=128',
    gradient: 'from-cyan-400/20 to-teal-500/20',
  },
];

export function MarqueeScroller() {
  // Duplicate list to guarantee seamless infinite scrolling
  const items = [...logosList, ...logosList];

  return (
    <div className="relative w-full overflow-hidden mt-10 py-4 marquee-container select-none">
      {/* Premium masking gradients on sides */}
      <div className="absolute inset-y-0 left-0 w-32 z-10 pointer-events-none bg-gradient-to-r from-[#f9fafb] to-transparent dark:from-[#060e1a]" />
      <div className="absolute inset-y-0 right-0 w-32 z-10 pointer-events-none bg-gradient-to-l from-[#f9fafb] to-transparent dark:from-[#060e1a]" />

      <div className="flex gap-6 animate-marquee w-max">
        {items.map((logo, index) => (
          <div
            key={`${logo.name}-${index}`}
            className="group relative h-24 w-40 shrink-0 flex items-center justify-center rounded-full bg-white border border-slate-200/60 shadow-sm hover:border-slate-300 transition-all overflow-hidden cursor-pointer"
          >
            {/* The absolute hover gradient background layer */}
            <div
              className={`absolute inset-0 bg-gradient-to-tr ${logo.gradient} opacity-0 scale-[1.5] group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-out`}
            />

            {/* Logo Image */}
            <img
              src={logo.src}
              alt={logo.name}
              className="relative z-10 h-10 w-24 object-contain transition-all duration-300 group-hover:brightness-0 group-hover:invert filter drop-shadow-sm"
              onError={(e) => {
                // Fail-safe text fallback if svgl.app fails
                const el = e.currentTarget;
                el.style.display = 'none';
                const sibling = el.nextElementSibling as HTMLSpanElement;
                if (sibling) sibling.style.display = 'block';
              }}
            />
            <span
              className="relative z-10 text-[13px] font-bold text-slate-700 hidden group-hover:text-black transition-colors"
            >
              {logo.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
