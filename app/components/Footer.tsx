"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <svg 
                className="h-8 w-auto text-white"
                viewBox="0 0 151.02 29.93"
                fill="currentColor"
              >
                <path d="M27.49,14.96c0,6.91-5.62,12.53-12.53,12.53S2.43,21.87,2.43,14.96,8.06,2.43,14.96,2.43s12.53,5.62,12.53,12.53M29.93,14.96C29.93,6.71,23.22,0,14.96,0S0,6.71,0,14.96s6.71,14.96,14.96,14.96,14.96-6.71,14.96-14.96"/>
                <path d="M22.25,15.72l-3.52,3.46-2.12-2.09.83-.82c1.36-1.49-.38-2.8-.38-2.8-.01,0-.02,0-.03-.01l-2.99,2.96-.18.18-2.62,2.58-3.52-3.46c-.48-.48-.49-1.25,0-1.73l3.52-3.47,2.12,2.09-.83.82c-1.36,1.49.38,2.8.38,2.8.01,0,.02,0,.03.01l5.79-5.73,3.52,3.46c.48.48.48,1.26,0,1.73M23.87,12.39l-4.94-4.87c-.1-.1-.31-.1-.41,0l-3.54,3.5-3.54-3.49c-.1-.1-.3-.1-.41,0l-4.94,4.87c-.67.66-1.04,1.54-1.04,2.47s.37,1.81,1.04,2.47l4.94,4.87c.1.1.3.11.41,0l3.54-3.5,3.54,3.49c.12.12.29.12.41,0l4.94-4.87c.67-.66,1.04-1.54,1.04-2.47s-.37-1.81-1.04-2.47"/>
                <path d="M124.56,21.47c-3.2,0-5.2-2.51-5.2-6.56s1.94-6.5,5.2-6.5,5.16,2.43,5.16,6.5-1.98,6.56-5.16,6.56M124.56,4.89c-6.01,0-9.75,3.84-9.75,10.03s3.74,10.05,9.75,10.05,9.72-3.85,9.72-10.05-3.72-10.03-9.72-10.03"/>
                <path d="M94.6,21.37h-10.75v-4.89h6.64c.7-.09,1.51-.38,1.51-1.24l.02-2.17h-8.18v-4.3h8.54c.89-.07,1.42-.76,1.64-1.23.27-.58.74-2.46.74-2.46,0,0-13.63,0-13.65,0-1,0-1.82.72-1.82,1.6v16.51c0,.88.82,1.6,1.82,1.6h11.8c.94-.07,1.68-.76,1.68-1.59,0-.03,0-1.82,0-1.82"/>
                <path d="M149.36,24.8c.93-.07,1.64-.74,1.66-1.56v-1.85h-9.6V5.06h-4.56v19.73h12.5Z"/>
                <path d="M98.77,24.05c2.65.77,4.32.92,6.17.92,3.67,0,8.05-.98,8.05-5.65,0-2.89-1.41-4.28-5.79-5.75l-2.66-.88c-1.75-.57-2.99-1.08-2.99-2.3s1.31-1.98,3.27-1.98c1.4,0,2.68.29,3.85.6l.61.17c.9.13,1.58-.25,2.01-1.14l.73-1.78-2.21-.66c-1.61-.48-3.29-.72-4.99-.72-4.92,0-7.86,2.06-7.86,5.51,0,2.85,1.39,4.22,5.73,5.66l2.66.9c1.42.48,3.05,1.19,3.05,2.36,0,2.15-2.6,2.15-3.46,2.15-1.5,0-2.95-.21-4.7-.69l-.85-.23c-.14-.03-.29-.04-.44-.04-.94,0-1.44.66-1.7,1.22l-.68,1.69,2.2.63h0Z"/>
                <path d="M70.6,21.63l.7,1.52c.62,1.22,1.51,1.62,2.49,1.62h3.18s-2.29-4.65-2.35-4.8c-.63-1.22-1.78-2.94-2.63-3.28-.09-.04-.59-.23-.59-.23,0,0,.53-.22.64-.27,1.65-.65,3.57-2.44,3.57-5.03,0-3.71-2.81-6.06-7.7-6.06,0,0-7.13,0-7.17,0-.89,0-1.8.99-1.8,1.75v17.93h4.56V8.74h4.41c1.86,0,3.11,1.1,3.11,2.74,0,1.85-1.28,2.74-3.78,2.74-.79,0-1.18.15-1.47.47-.63.67-.69,1.96-.62,2.96,3.42.12,4.39,1.65,5.46,3.96"/>
                <path d="M54.02,21.04s-2.16.44-3.61.44c-3.37,0-5.39-2.43-5.39-6.5v-.1c0-4.07,2.01-6.5,5.39-6.5,1.44,0,3.61.44,3.61.44.76.09,1.51-.24,1.91-1.08.21-.44.66-1.85.66-1.85l-1.54-.46c-1.47-.42-2.77-.58-4.64-.58-6.15,0-9.98,3.84-9.98,10.02v.1c0,6.18,3.82,10.02,9.98,10.02,1.87,0,3.17-.16,4.64-.58l1.54-.46s-.45-1.4-.66-1.85c-.4-.84-1.16-1.18-1.91-1.08"/>
              </svg>
            </div>
            <p className="text-white/90 text-sm leading-relaxed">
              Portal de comunicação interna da Cresol Fronteiras PR/SC/SP/ES.
              Sua cooperativa de crédito, completa para todos.
            </p>
          </div>

          {/* Conecte-se */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold text-white mb-4">Conecte-se</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full mr-3 flex-shrink-0"></div>
                <a 
                  href="https://cresol.com.br/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-white/80 transition-colors text-sm"
                >
                  Site Cresol
                </a>
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full mr-3 flex-shrink-0"></div>
                <a 
                  href="https://cresol.com.br/institucional/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-white/80 transition-colors text-sm"
                >
                  Institucional
                </a>
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full mr-3 flex-shrink-0"></div>
                <a 
                  href="https://cresol.workplace.com/work/landing/input/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-white/80 transition-colors text-sm"
                >
                  Workplace
                </a>
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full mr-3 flex-shrink-0"></div>
                <a 
                  href="https://cresol.com.br/baser/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-white/80 transition-colors text-sm"
                >
                  Cresol Baser
                </a>
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full mr-3 flex-shrink-0"></div>
                <a 
                  href="https://cresolcarreiras.gupy.io/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-white/80 transition-colors text-sm"
                >
                  Gupy
                </a>
              </li>
            </ul>
          </div>

          {/* Links Rápidos */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold text-white mb-4">Links Rápidos</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full mr-3 flex-shrink-0"></div>
                <Link 
                  href="/home"
                  className="text-white hover:text-white/80 transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full mr-3 flex-shrink-0"></div>
                <Link 
                  href="/noticias"
                  className="text-white hover:text-white/80 transition-colors text-sm"
                >
                  Notícias
                </Link>
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full mr-3 flex-shrink-0"></div>
                <Link 
                  href="/eventos"
                  className="text-white hover:text-white/80 transition-colors text-sm"
                >
                  Eventos
                </Link>
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full mr-3 flex-shrink-0"></div>
                <Link 
                  href="/galeria"
                  className="text-white hover:text-white/80 transition-colors text-sm"
                >
                  Galeria
                </Link>
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full mr-3 flex-shrink-0"></div>
                <Link 
                  href="/videos"
                  className="text-white hover:text-white/80 transition-colors text-sm"
                >
                  Vídeos
                </Link>
              </li>
            </ul>
          </div>

          {/* Redes Sociais */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold text-white mb-4">Siga nossas redes sociais</h3>
            <div className="flex gap-3 mb-6">
              <a 
                href="https://www.instagram.com/cresolfronteiras/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 hover:opacity-80 transition-opacity"
                aria-label="Instagram"
              >
                <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0ZM18.7233 11.2773C20.0886 11.2152 20.5249 11.2 24.0012 11.2H23.9972C27.4746 11.2 27.9092 11.2152 29.2746 11.2773C30.6373 11.3397 31.5679 11.5555 32.384 11.872C33.2266 12.1987 33.9386 12.636 34.6506 13.348C35.3627 14.0595 35.8 14.7736 36.128 15.6155C36.4427 16.4294 36.6587 17.3595 36.7227 18.7222C36.784 20.0876 36.8 20.5238 36.8 24.0001C36.8 27.4764 36.784 27.9116 36.7227 29.277C36.6587 30.6391 36.4427 31.5695 36.128 32.3837C35.8 33.2253 35.3627 33.9394 34.6506 34.6509C33.9394 35.3629 33.2264 35.8013 32.3848 36.1283C31.5703 36.4448 30.6391 36.6605 29.2765 36.7229C27.9111 36.7851 27.4762 36.8003 23.9996 36.8003C20.5236 36.8003 20.0876 36.7851 18.7222 36.7229C17.3598 36.6605 16.4294 36.4448 15.615 36.1283C14.7736 35.8013 14.0595 35.3629 13.3483 34.6509C12.6365 33.9394 12.1992 33.2253 11.872 32.3834C11.5557 31.5695 11.34 30.6394 11.2773 29.2767C11.2155 27.9114 11.2 27.4764 11.2 24.0001C11.2 20.5238 11.216 20.0873 11.2771 18.7219C11.3384 17.3598 11.5544 16.4294 11.8717 15.6152C12.1997 14.7736 12.6371 14.0595 13.3491 13.348C14.0606 12.6363 14.7747 12.1989 15.6166 11.872C16.4305 11.5555 17.3606 11.3397 18.7233 11.2773Z" fill="white"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M22.853 13.5067C23.0759 13.5064 23.3158 13.5065 23.5746 13.5066L24.0013 13.5067C27.4189 13.5067 27.824 13.519 29.1736 13.5803C30.4216 13.6374 31.0989 13.8459 31.5501 14.0211C32.1475 14.2531 32.5733 14.5305 33.0211 14.9785C33.4691 15.4265 33.7464 15.8532 33.979 16.4505C34.1542 16.9012 34.363 17.5785 34.4198 18.8265C34.4811 20.1759 34.4944 20.5812 34.4944 23.9972C34.4944 27.4133 34.4811 27.8186 34.4198 29.168C34.3627 30.416 34.1542 31.0933 33.979 31.544C33.747 32.1413 33.4691 32.5667 33.0211 33.0144C32.5731 33.4624 32.1477 33.7398 31.5501 33.9718C31.0995 34.1478 30.4216 34.3558 29.1736 34.4128C27.8242 34.4742 27.4189 34.4875 24.0013 34.4875C20.5834 34.4875 20.1783 34.4742 18.8289 34.4128C17.5809 34.3552 16.9036 34.1467 16.4521 33.9715C15.8548 33.7395 15.4281 33.4621 14.9801 33.0141C14.5321 32.5661 14.2548 32.1405 14.0222 31.5429C13.847 31.0923 13.6382 30.4149 13.5814 29.1669C13.5201 27.8176 13.5078 27.4122 13.5078 23.994C13.5078 20.5759 13.5201 20.1727 13.5814 18.8233C13.6385 17.5753 13.847 16.898 14.0222 16.4468C14.2542 15.8494 14.5321 15.4228 14.9801 14.9748C15.4281 14.5268 15.8548 14.2494 16.4521 14.0169C16.9033 13.8409 17.5809 13.6329 18.8289 13.5755C20.0097 13.5222 20.4674 13.5062 22.853 13.5035V13.5067ZM30.8339 15.6321C29.9859 15.6321 29.2978 16.3193 29.2978 17.1676C29.2978 18.0156 29.9859 18.7036 30.8339 18.7036C31.6819 18.7036 32.3699 18.0156 32.3699 17.1676C32.3699 16.3196 31.6819 15.6316 30.8339 15.6316V15.6321ZM17.4279 24.0002C17.4279 20.3701 20.3709 17.4269 24.001 17.4268C27.6312 17.4268 30.5736 20.37 30.5736 24.0002C30.5736 27.6304 27.6314 30.5723 24.0013 30.5723C20.3711 30.5723 17.4279 27.6304 17.4279 24.0002Z" fill="white"/>
                  <path d="M24.0011 19.7334C26.3574 19.7334 28.2678 21.6436 28.2678 24.0001C28.2678 26.3564 26.3574 28.2668 24.0011 28.2668C21.6445 28.2668 19.7344 26.3564 19.7344 24.0001C19.7344 21.6436 21.6445 19.7334 24.0011 19.7334Z" fill="white"/>
                </svg>
              </a>
              <a 
                href="https://www.facebook.com/cresolfronteiras/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 hover:opacity-80 transition-opacity"
                aria-label="Facebook"
              >
                <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0ZM26.5016 25.0542V38.1115H21.0991V25.0547H18.4V20.5551H21.0991V17.8536C21.0991 14.1828 22.6231 12 26.9532 12H30.5581V16.5001H28.3048C26.6192 16.5001 26.5077 17.1289 26.5077 18.3025L26.5016 20.5546H30.5836L30.1059 25.0542H26.5016Z" fill="white"/>
                </svg>
              </a>
              <a 
                href="https://www.youtube.com/channel/UCkOdjj_6xR5cgnDNl_ydi5A" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 hover:opacity-80 transition-opacity"
                aria-label="YouTube"
              >
                <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0ZM34.0016 15.7493C35.1031 16.0516 35.9706 16.9422 36.265 18.0732C36.8 20.123 36.8 24.4 36.8 24.4C36.8 24.4 36.8 28.6768 36.265 30.7268C35.9706 31.8578 35.1031 32.7484 34.0016 33.0508C32.0054 33.6 24 33.6 24 33.6C24 33.6 15.9946 33.6 13.9983 33.0508C12.8967 32.7484 12.0292 31.8578 11.7348 30.7268C11.2 28.6768 11.2 24.4 11.2 24.4C11.2 24.4 11.2 20.123 11.7348 18.0732C12.0292 16.9422 12.8967 16.0516 13.9983 15.7493C15.9946 15.2 24 15.2 24 15.2C24 15.2 32.0054 15.2 34.0016 15.7493Z" fill="white"/>
                  <path d="M21.6001 28.8V20.8L28.0001 24.8001L21.6001 28.8Z" fill="white"/>
                </svg>
              </a>
            </div>
            <p className="text-white/90 text-xs">
              Ferramenta de uso interno
            </p>
          </div>
        </div>

        {/* Linha divisória */}
        <div className="border-t border-white/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/90 text-sm text-center md:text-left">
              © {currentYear} Cresol Fronteiras PR/SC/SP/ES - Todos os Direitos Reservados.
            </p>
            <p className="text-white/70 text-xs mt-2 md:mt-0">
              Desenvolvido com ❤️ para nossa cooperativa
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 