import React from 'react';

const Certificate = ({ userName, examTitle, date, score, onExclude }) => {
  return (
    <div className="certificate-container p-8 bg-white border-[16px] border-double border-coursera-blue shadow-2xl max-w-4xl mx-auto relative overflow-hidden my-10 font-serif">
      
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#0056D2_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-coursera-blue/20"></div>
      <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-coursera-blue/20"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-coursera-blue/20"></div>
      <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-coursera-blue/20"></div>

      <div className="relative z-10 text-center border-4 border-coursera-blue/10 p-12">
        
        <div className="mb-8">
          <div className="w-16 h-16 bg-coursera-blue rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-3xl">E</span>
          </div>
          <h2 className="text-coursera-blue text-sm font-bold tracking-[0.3em] uppercase mb-2">Certificat de Réussite</h2>
          <div className="w-24 h-1 bg-coursera-blue mx-auto"></div>
        </div>

        <div className="space-y-6 mb-12">
          <p className="text-gray-500 italic">Ce certificat est fièrement décerné à</p>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">{userName}</h1>
          <p className="text-gray-500 italic max-w-md mx-auto leading-relaxed">
            Pour avoir démontré une maîtrise exceptionnelle et complété avec succès toutes les exigences de l'examen :
          </p>
          <h3 className="text-2xl font-bold text-coursera-blue underline decoration-coursera-blue/30 underline-offset-8">{examTitle}</h3>
        </div>

        <div className="flex justify-center gap-12 mb-12">
          <div className="text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Date</p>
            <p className="font-bold text-gray-800">{new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Score</p>
            <p className="font-bold text-gray-800">{score}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">ID Certificat</p>
            <p className="font-bold text-gray-800">EP-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
          </div>
        </div>

        <div className="flex justify-between items-end mt-16 px-12">
          <div className="text-center">
            <div className="w-40 border-b border-gray-300 mb-2 py-2">
              <span className="font-script text-2xl text-gray-700 italic">ExamPlatform</span>
            </div>
            <p className="text-[10px] text-gray-400 uppercase font-bold">Direction Académique</p>
          </div>
          
          <div className="relative">
            <div className="w-24 h-24 border-4 border-coursera-blue/20 rounded-full flex items-center justify-center">
              <div className="w-20 h-20 border-2 border-dashed border-coursera-blue/30 rounded-full flex items-center justify-center bg-coursera-blue/5">
                <span className="text-[10px] font-bold text-coursera-blue uppercase text-center leading-none">Sceau Officiel<br/>ExamPlatform</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="w-40 border-b border-gray-300 mb-2 py-2">
              <span className="font-script text-2xl text-gray-700 italic">Academy Prof</span>
            </div>
            <p className="text-[10px] text-gray-400 uppercase font-bold">Responsable Certification</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Certificate;
