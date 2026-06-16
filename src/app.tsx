import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
import './app.scss';

function App(props) {
  const initStore = useAppStore(s => s.initStore)

  useEffect(() => {
    initStore()
  }, [initStore])

  useDidShow(() => {
    initStore()
  })

  useDidHide(() => {});

  return props.children;
}

export default App;
