import React, { PropsWithChildren } from 'react';

const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="bg-gradient-to-br from-cyan-400 to-purple-400 dark:from-slate-900 dark:to-slate-950 min-h-[calc(100vh-174px)] flex items-center justify-center p-4">
      {children}
    </div>
  );
};

export default AuthLayout;
