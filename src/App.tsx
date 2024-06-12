import React, { Suspense } from 'react';
import { Router, Switch, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import Page from '@demo/components/Page';
import store from '@demo/store';
import '@demo/styles/common.scss';
import './index.css';
import { history } from './utils/history';
import { ConversationManagerProvider } from './context/ConversationManagerContext';
// import Home from '@demo/pages/Home';

const Editor = React.lazy(() => import('@demo/pages/Editor'));

function App() {
  return (
    <Provider store={store}>
      <ConversationManagerProvider>
        <Page>
          <Suspense
            fallback={
              <div
                style={{
                  width: '100vw',
                  height: '100vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  width='200px'
                  src='/loading'
                  alt=''
                />
                <p
                  style={{
                    fontSize: 24,
                    color: 'rgba(0, 0, 0, 0.65)',
                  }}
                >
                  {/* Please wait a moment. */}
                </p>
              </div>
            }
          >
            <Router history={history}>
              <Switch>
                <Route
                  path='/'
                  exact
                  component={Editor}
                />
                <Route
                  path='/editor'
                  component={Editor}
                />
              </Switch>
            </Router>
          </Suspense>
        </Page>
      </ConversationManagerProvider>
    </Provider>
  );
}

export default App;
