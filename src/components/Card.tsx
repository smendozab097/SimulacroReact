import type { ReactNode } from "react";

interface CardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const Card = ({ title, subtitle, children }: CardProps) => {
  return (
    <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl shadow-slate-100/50 backdrop-blur-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black tracking-tight text-slate-800">
          {title}
        </h2>
        <p className="text-slate-500 text-sm mt-1 leading-relaxed">
          {subtitle}
        </p>
      </div>
      {children}
    </div>
  );
};

export default Card;