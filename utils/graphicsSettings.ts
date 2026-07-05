export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const isSmallScreen = window.innerWidth <= 768;
  return mobileRegex.test(userAgent) || isSmallScreen;
};

export const getInitialGraphicsSetting = (): boolean => {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem('k_fancy_graphics');
  if (stored !== null) {
    return stored === 'true';
  }
  // Default to low graphics (false) if mobile, otherwise high quality (true)
  const isMobile = isMobileDevice();
  const defaultValue = !isMobile;
  localStorage.setItem('k_fancy_graphics', String(defaultValue));
  return defaultValue;
};

export const applyGraphicsSettings = (fancyGraphics: boolean) => {
  if (typeof document !== 'undefined') {
    if (fancyGraphics) {
      document.documentElement.classList.remove('low-graphics');
      document.body.classList.remove('low-graphics');
    } else {
      document.documentElement.classList.add('low-graphics');
      document.body.classList.add('low-graphics');
    }
  }
};

export const applySmartphoneMode = () => {
  if (typeof document !== 'undefined') {
    const isMobile = isMobileDevice();
    if (isMobile) {
      document.documentElement.classList.add('smartphone-mode');
      document.body.classList.add('smartphone-mode');
    } else {
      document.documentElement.classList.remove('smartphone-mode');
      document.body.classList.remove('smartphone-mode');
    }
  }
};
