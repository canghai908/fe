import React, { useState, useEffect, useLayoutEffect } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import _ from 'lodash';
import { ConfigProvider } from 'antd';
import antdZhCN from 'antd/lib/locale/zh_CN';
import antdEnUS from 'antd/lib/locale/en_US';
import { IntlProvider } from 'react-intl';
import Layout from '@pkgs/Layout';
import { InjectIntlContext } from '@pkgs/hooks/useFormatMessage';
import { Login, Register } from '@pkgs/Auth';
import { Page403, Page404 } from '@pkgs/Exception';
import request from '@pkgs/request';
import api from '@pkgs/api';
import TaskOutput from './pages/TaskOutput';
import TaskHostOutput from './pages/TaskOutput/host';
import BigScreen from './pages/BigScreen';
import intlZhCN from './locales/zh';
import intlEnUS from './locales/en';
import registerApps from '../config/registerApps';

interface LocaleMap {
  [index: string]: any,
}

const localeMap: LocaleMap = {
  zh: {
    antd: antdZhCN,
    intl: 'zh',
    intlMessages: intlZhCN,
  },
  en: {
    antd: antdEnUS,
    intl: 'en',
    intlMessages: intlEnUS,
  },
};

export const { Provider, Consumer } = React.createContext('zh');

export default function App() {
  const [language, setlanguage] = useState(window.localStorage.getItem('language') || navigator.language.substr(0, 2));
  const [belongProjects, setBelongProjects] = useState([]);
  const [selectedTenantProject, setSelectedTenantProject] = useState();
  const [tenantProjectVisible, setTenantProjectVisible] = useState(true);
  const intlMessages = _.get(localeMap[language], 'intlMessages', intlZhCN);

  useLayoutEffect(() => {
    window.addEventListener('message', (event) => {
      const { data } = event;
      if (_.isPlainObject(data) && data.type === 'tenantProjectVisible') {
        setTenantProjectVisible(data.value);
      }
    }, false);
  }, []);

  useEffect(() => {
    window.postMessage({
      type: 'tenantProject',
      value: selectedTenantProject,
    }, window.origin);
  }, [selectedTenantProject]);

  useEffect(() => {
    window.localStorage.setItem('language', language);
    window.postMessage({
      type: 'language',
      value: language,
    }, window.origin);
  }, [language]);

  return (
    <IntlProvider
      locale={_.get(localeMap[language], 'intl', 'zh')}
      messages={intlMessages}
    >
      <ConfigProvider locale={_.get(localeMap[language], 'antd', antdZhCN)}>
        <InjectIntlContext>
          <Provider value={language}>
            <BrowserRouter>
              <Switch>
                <Route path="/login" component={Login} />
                <Route path="/register" component={Register} />
                <Route path="/403" component={Page403} />
                <Route path="/404" component={Page404} />
                <Route exact path="/task-output/:taskId/:outputType" component={TaskOutput} />
                <Route exact path="/task-output/:taskId/:host/:outputType" component={TaskHostOutput} />
                <Route exact path="/big-screen/:id" render={(props: any) => {
                  return <BigScreen {...props} mode="full-screen" />;
                }} />
                <Route exact path="/big-screen/modify/:id" render={(props: any) => {
                  return <BigScreen {...props} mode="editable" />;
                }} />
                <Route exact path="/" render={() => <Redirect to="/rdb" />} />
                <Layout
                  language={language}
                  onLanguageChange={setlanguage}
                  tenantProjectVisible={tenantProjectVisible}
                  belongProjects={belongProjects}
                  selectedTenantProject={selectedTenantProject}
                  setSelectedTenantProject={setSelectedTenantProject}
                  onMount={() => {
                    request(`${api.tree}/projs`).then((res) => {
                      setBelongProjects(res);
                    });
                    registerApps({}, () => {
                      request(api.permissionPoint).then((res) => {
                        const permissionPoint: any = {};
                        _.forEach(res, (_val, key) => {
                          permissionPoint[key] = true;
                        });
                        window.postMessage({
                          type: 'permissionPoint',
                          value: permissionPoint,
                        }, window.origin);
                      });
                      window.postMessage({
                        type: 'tenantProject',
                        value: {
                          tenant: _.attempt(JSON.parse.bind(null, localStorage.getItem('icee-global-tenant') as string)),
                          project: _.attempt(JSON.parse.bind(null, localStorage.getItem('icee-global-project') as string))
                        }
                      }, window.origin);
                    });
                  }}
                >
                  <div id="ecmc-layout-container" />
                </Layout>
                <Route render={() => <Redirect to="/404" />} />
              </Switch>
            </BrowserRouter>
          </Provider>
        </InjectIntlContext>
      </ConfigProvider>
    </IntlProvider>
  );
}
