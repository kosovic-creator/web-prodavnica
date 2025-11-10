/***
Različite varijante backdrop blur efekata za ConfirmModal:

1. Trenutno (blagi blur):
   className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"

2. Jači blur efekat:
   className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"

3. Najjači blur:
   className="fixed inset-0 bg-gray-900/10 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"

4. Blur sa tamnijom pozadinom:
   className="fixed inset-0 bg-black/10 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"

5. Blur sa svetlom pozadinom:
   className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"

6. Blur sa gradientom (napredni efekat):
   className="fixed inset-0 bg-gradient-to-br from-white/20 to-gray-100/30 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"

Tailwind backdrop-blur klase:
- backdrop-blur-none: Ne blur
- backdrop-blur-sm: 4px blur
- backdrop-blur: 8px blur
- backdrop-blur-md: 12px blur
- backdrop-blur-lg: 16px blur
- backdrop-blur-xl: 24px blur
- backdrop-blur-2xl: 40px blur
- backdrop-blur-3xl: 64px blur

Animacije:
- animate-in fade-in: Fade in efekat
- zoom-in-95: Modal se "uvećava" kad se otvori
- slide-in-from-bottom: Modal dolazi odozdo
- slide-in-from-top: Modal dolazi odozgo
*/
