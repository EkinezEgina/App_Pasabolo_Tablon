import type { SVGProps } from 'react';

export function PasaboloIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2a3 3 0 0 1 3 3v2a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
      <path d="M15 7c0 2.2-1.8 4-4 4s-4-1.8-4-4" />
      <path d="M7 7h10" />
      <path d="M9 7v10c0 2.2 1.8 4 4 4s4-1.8 4-4V7" />
      <path d="M9 21h6" />
    </svg>
  );
}
