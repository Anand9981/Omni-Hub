import { useEffect } from 'react';
import ChatWidget from '../../components/widget/ChatWidget.jsx';

export default function WidgetPage() {
  useEffect(() => {
    document.body.classList.add('omni-widget-frame');
    return () => document.body.classList.remove('omni-widget-frame');
  }, []);

  return <main aria-label="OmniHub website chat widget" className="omni-widget-frame-page"><ChatWidget /></main>;
}
