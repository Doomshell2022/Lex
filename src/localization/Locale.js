import LocalizedStrings from 'react-native-localization';

// locales
import {en_IN} from './en_IN';
// import {es_HN} from './es_HN';

export const localizedStrings = new LocalizedStrings({
  'en-IN': {
    ...en_IN,
  },
  // 'es-HN': {
  //   ...es_HN,
  // },
});
