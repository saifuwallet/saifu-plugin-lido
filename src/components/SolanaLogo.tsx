const SolanaLogo = () => {
  return (
    <svg
      className="absolute top-1/2 transform -translate-y-1/2 left-4"
      width="24"
      height="24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="24" rx="12" fill="#000"></rect>
      <path
        d="M17.129 9.033a.442.442 0 01-.314.132H5.695c-.393 0-.592-.48-.318-.764l1.824-1.89a.441.441 0 01.318-.136H18.68c.396 0 .594.485.314.768l-1.865 1.89zm0 8.44a.447.447 0 01-.314.129H5.695a.438.438 0 01-.318-.745l1.824-1.843a.447.447 0 01.318-.132H18.68c.396 0 .594.472.314.748l-1.865 1.843zm0-6.716a.447.447 0 00-.314-.128H5.695a.438.438 0 00-.318.745l1.824 1.842a.446.446 0 00.318.132H18.68a.438.438 0 00.314-.748l-1.865-1.843z"
        fill="url(#solana-round_svg__paint0_linear)"
      ></path>
      <defs>
        <linearGradient
          id="solana-round_svg__paint0_linear"
          x1="6.263"
          y1="17.906"
          x2="18.092"
          y2="6.077"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#CF41E8"></stop>
          <stop offset="1" stopColor="#10F2B0"></stop>
        </linearGradient>
      </defs>
    </svg>
  );
};

export default SolanaLogo;
