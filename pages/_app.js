import '../styles/index.css'
import 'prismjs/themes/prism-okaidia.css'

import { useEffect } from 'react';
import TagManager from 'react-gtm-module';

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    TagManager.initialize({ gtmId: 'G-8MHXSDEJKL' });
  });
  return <Component {...pageProps} />
}
