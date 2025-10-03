import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TranslatedTextProps {
  text: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

const TranslatedText: React.FC<TranslatedTextProps> = ({ text, as: Component = 'span', className }) => {
  const { t, language } = useLanguage();
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    if (language === 'en') {
      setTranslated(text);
      return;
    }

    let mounted = true;
    t(text).then(result => {
      if (mounted) setTranslated(result);
    });

    return () => { mounted = false; };
  }, [text, language, t]);

  return <Component className={className}>{translated}</Component>;
};

export default TranslatedText;
