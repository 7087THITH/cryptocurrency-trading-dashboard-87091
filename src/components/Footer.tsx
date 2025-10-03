import TranslatedText from './TranslatedText';

const Footer = () => {
  return (
    <footer className="w-full py-6 px-4 mt-8 border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto text-center space-y-1">
        <TranslatedText text="Part Procurement Division" as="p" className="text-sm font-medium text-foreground" />
        <TranslatedText text="Daikin Industries (Thailand). All rights reserved." as="p" className="text-sm text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Mr. Naito Yuhei (Manager), Mr. Thitichot Chumchuang (Dev), Ms. Orapin Khluinori
        </p>
      </div>
    </footer>
  );
};

export default Footer;
