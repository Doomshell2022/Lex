/* NavigationService.js */

import {NavigationActions} from 'react-navigation';

let topLevelNavigator = null;

/**
 * Set the top-level navigator reference.
 * Should be called in App.js or entry point using ref.
 */
function nsSetTopLevelNavigator(navigatorRef) {
  topLevelNavigator = navigatorRef;
}

/**
 * Navigate to a route by name, with optional params.
 */
function nsNavigate(routeName, params = {}) {
  if (topLevelNavigator && routeName) {
    const navigateAction = NavigationActions.navigate({
      routeName,
      params,
    });
    topLevelNavigator.dispatch(navigateAction);
  } else {
    console.warn('Navigation failed: no navigator or routeName');
  }
}

export {nsSetTopLevelNavigator, nsNavigate};
